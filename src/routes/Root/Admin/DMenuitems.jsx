import {
  MdHome,
  MdCategory,
  MdBusiness,
  MdPerson,
  MdShoppingCart,
  MdSettings,
  MdLogin,
  MdError,
  MdWork,
} from "react-icons/md";

const DMenuitems = () => {
  return [
    {
      title: "Home",
      path: "/admin/home",
      icon: <MdHome className="text-lg" />,
    },
    {
      title: "Category",
      path: "/admin/category",
      icon: <MdCategory className="text-lg" />,
    },
    {
      title: "Company",
      path: "/admin/company",
      icon: <MdBusiness className="text-lg" />,
    },
    {
      title: "User",
      path: "/admin/user",
      icon: <MdPerson className="text-lg" />,
    },
    {
      title: "Product",
      path: "/admin/product",
      icon: <MdShoppingCart className="text-lg" />,
    },
    {
      title: "Log Data",
      icon: <MdSettings className="text-lg" />,
      list: [
        {
          title: "Login Log",
          path: "/admin/login-log",
          icon: <MdLogin className="text-lg" />,
        },
        {
          title: "Error Log",
          path: "/admin/error-log",
          icon: <MdError className="text-lg" />,
        },
        {
          title: "Work Log",
          path: "/admin/work-log",
          icon: <MdWork className="text-lg" />,
        },
      ],
    },
  ];
};

export default DMenuitems;
