import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function App() {
  const [apartment, setApartment] = useState("");
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  useEffect(() => {
    fetch("/payments")
      .then((response) => response.json())
      .then((data) => setPayments(data));
  }, []);

  const handleLogin = (e:any) => {
    e.preventDefault();
    setFilteredPayments(
      payments.filter((payment:any) => payment.apartment === parseInt(apartment))
    );
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-2 py-12 lg:px-8">
      <h1 className="text-3xl font-bold text-center underline">الياسمين د</h1>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="jasmin_d"
            src="./src/assets/mark.svg"
            className="mx-auto h-14 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            شاشة الفواتير
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="apartment_number"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                رقم الشقة
              </label>
              <div className="mt-2">
                <input
                  id="apartment_number"
                  name="apartment_number"
                  type="number"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                افحص الفواتير
              </button>
            </div>
          </form>
        </div>

        {filteredPayments.length > 0 && (
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <h3 className="text-xl font-bold text-center">قائمة المدفوعات</h3>
            <ul className="mt-4 space-y-2">
              {filteredPayments.map((payment: any) => (
                <li key={payment.id} className="border p-2 rounded-md">
                  <p>المبلغ: {payment.amount}</p>
                  <p>التاريخ: {payment.date}</p>
                  <p>الوصف: {payment.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <Link to="/admin" className="text-indigo-600 hover:text-indigo-500">
            تسجيل الدخول كمسؤول
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
