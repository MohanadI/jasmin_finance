import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Providers/AuthProvider";
import   
 pdfMake, { fonts } from "pdfmake/build/pdfmake";
import vfs_fonts from "pdfmake/build/vfs_fonts.js";
pdfMake.vfs = vfs_fonts.pdfMake.vfs; // Register fonts for pdfmake

type Payment = {
  id: number;
  apartment: number;
  amount: number;
  date: string;
  description: string;
  status: string;
};

function AdminDashboard() {
  const [apartment, setApartment] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logoutCallback } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const response = await fetch("/payments");
    const data = await response.json();
    setPayments(data);
  };

  const handlePaymentSubmit = async (e: any) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Authorization", token || "");
    headers.append("Content-Type", "application/json");
    await fetch("/payment", {
      method: "POST",
      headers,
      body: JSON.stringify({ apartment, amount, date, description, status }),
    });
    fetchPayments(); // Refresh the payments list
  };

  const handleExpenseSubmit = async (e: any) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Authorization", token || "");
    headers.append("Content-Type", "application/json");
    await fetch("/expense", {
      method: "POST",
      headers,
      body: JSON.stringify({ description, amount, date }),
    });
  };

  const handleLogout = async () => {
    await fetch("/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    localStorage.removeItem("token");
    logoutCallback();
    navigate("/admin");
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.apartment?.toString().includes(searchQuery) ||
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateInvoicePDF = (payment: Payment) => {
    const elementStyle = {
      fontSize: 14,
      paddingTop: 10,
      paddingBottom: 10,
      margin: [10, 10, 10, 10],
    };
    const docDefinition: any = {
      pageSize: "A4",
      pageOrientation: "portrait",
      content: [
        {
          text: "Jasmin D - Payment Invoice",
          fontSize: 18,
          alignment: "center",
        },
        {
          text: `Apartment Number: ${payment.apartment}`,
          elementStyle,
        },
        {
          text: `Amount: ${payment.amount}`,
          elementStyle,
        },
        { text: `Date: ${payment.date}`, elementStyle },
        { text: `Description: ${payment.description}`, elementStyle },
        {
          text: `Status: ${payment.status === "paid" ? "Paid" : "Not Paid"}`,
          elementStyle,
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: "center",
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 0],
        },
        normal: {
          fontSize: 14,
        },
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`invoice-${payment.apartment}-${payment.date}.pdf`);
  };
  
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <img
          alt="Your Company"
          src="./src/assets/mark.svg"
          className="mx-auto h-10 w-auto"
        />
        <h1 className="font-bold mb-2 text-[26px] lg:text-2xl 4xl:text-[26px]">
          الياسمين د - لوحة التحكم
        </h1>
        <button
          className="bg-red-300 mb-4 p-1 rounded text-white text-xs w-32"
          onClick={handleLogout}
        >
          تسجيل خروج
        </button>
      </div>
      <h2 className="font-bold mb-2 text-[18px]">قائمة الفواتير</h2>
      <div className="flex flex-row justify-between">
        <input
          type="text"
          placeholder="ابحث باستخدام رقم الشقة أو الوصف"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded text-sm w-1/3"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 p-2 bg-blue-500 text-white rounded text-sm"
        >
          اضف دفعة جديدة
        </button>
      </div>
      <div className="overflow-x-auto sm:overflow-x-hidden">
        <table className="table-auto border-separate w-full sm:rounded-lg">
          <thead>
            <tr className="text-center bg-gray-100">
              <th className="py-2 px-4 border-b top-0 bg-white z-10 sticky right-0">
                رقم الشقة
              </th>
              <th className="py-2 px-4 border-b bg-gray:300">المبلغ</th>
              <th className="py-2 px-4 border-b bg-gray:300">التاريخ</th>
              <th className="py-2 px-4 border-b bg-gray:300">الوصف</th>
              <th className="py-2 px-4 border-b bg-gray:300">الحاله</th>
              <th className="py-2 px-4 border-b bg-gray:300"> تحميل </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment: Payment) => (
                <tr key={payment.id} className="text-center hover:bg-gray-200">
                  <td className="py-2 px-4 border-b top-0 bg-white z-10 sticky right-0">
                    {payment.apartment}
                  </td>
                  <td className="py-2 px-4 border-b bg-gray:300">
                    {payment.amount}
                  </td>
                  <td className="py-2 px-4 border-b bg-gray:300">
                    {payment.date}
                  </td>
                  <td className="py-2 px-4 border-b bg-gray:300">
                    {payment.description}
                  </td>
                  <td className="py-2 px-4 border-b bg-gray:300">
                    {payment.status === "paid" ? "مدفوع" : "غير مدفوع"}
                  </td>
                  <td className="py-2 px-4 border-b bg-gray:300">
                    <button
                      className="text-blue-500"
                      onClick={() => generateInvoicePDF(payment)}
                    >
                      <img
                        alt="download"
                        src="./src/assets/download.svg"
                        className="mx-auto h-6 w-auto"
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-2 px-4 border-b text-center">
                  لا يوجد مدفوعات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-2/4">
            <h2 className="text-xl mb-4">اضف دفعة جديده</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block mb-2">رقم الشقة</label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">المبلغ</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">التاريخ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">الوصف</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">الحاله</label>
                <select
                  className="p-2 border border-gray-300 rounded w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="paid">مدفوع</option>
                  <option value="unpaid">غير مدفوع</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 p-2 bg-gray-500 text-white rounded"
                >
                  الغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
