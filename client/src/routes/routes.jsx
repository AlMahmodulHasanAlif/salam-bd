// src/routes/router.jsx
import { createBrowserRouter } from "react-router";
import RootLayout from "../layout/RootLayout";
import AdminLayout from "../pages/Admin/AdminLayout";

// Pages
import Home from "../pages/Home/Home";
import IslamicBooks from "../pages/Products/IslamicBooks/IslamicBooks";
import WallFrame from "../pages/Products/WallFrame/WallFrame";
import Attar from "../pages/Products/Attar/Attar";
import HajjItem from "../pages/Products/HajjItem/HajjItem";
import Kids from "../pages/Products/Kids/Kids";
import ProductListPage from "../pages/Products/ProductListPage";
import ProductDetails from "../pages/Products/ProductDetails/ProducDetails";
import SearchResults from "../pages/Products/SearchResults";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Cart/Checkout";
import OrderSuccess from "../pages/Cart/OrderSuccess";
import Orders from "../pages/Orders/Orders";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminOrders from "../pages/Admin/AdminOrders";
import AdminUsers from "../pages/Admin/AdminUsers";
import UserDashboard from "../pages/Dashboard/UserDashboard";
import Gallery from "../pages/gallery/GalleryPage";
import AdminGallery from "../pages/Admin/AdminGallery";
import AdminBlog from "../pages/Admin/AdminBlog";
import Blog from "../pages/Blog/BlogPage";
import BlogDetails from "../pages/Blog/BlogDetailPage";
import NotFound from "../components/NotFound";
import PluginAdmin from "../pages/Admin/PluginAdmin";
import IslamicProducts from "../pages/Products/IslamicProducts/IslamicProducts";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicRoute from "./PublicRoute";
import ReturnPolicy from "../pages/Info/ReturnPolicy";
import TermsConditions from "../pages/Info/TermsConditions";
import PrivacyPolicy from "../pages/Info/PrivacyPolicy";
import AboutUs from "../pages/Info/AboutUs";
import ContactUs from "../pages/Info/ContactUs";
import FAQ from "../pages/Info/FAQ";
import ProfitAdmin from "../pages/Admin/ProfitAdmin";
import LandingPage from "../landing/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "books", Component: IslamicBooks },
      { path: "wallframe", Component: WallFrame },
      { path: "attar", Component: Attar },
      { path: "hajj-item", Component: HajjItem },
      { path: "islamic-products", Component: IslamicProducts },
      { path: "kids", Component: Kids },
      {
        path: "kids/toys",
        element: (
          <ProductListPage
            category="kids"
            subcategory="toys"
            title="Kids Toys"
            emoji="🚂"
          />
        ),
      },
      {
        path: "kids/clothes",
        element: (
          <ProductListPage
            category="kids"
            subcategory="clothes"
            title="Kids Clothes"
            emoji="👕"
          />
        ),
      },
      {
        path: "kids/books",
        element: (
          <ProductListPage
            category="kids"
            subcategory="books"
            title="Kids Books"
            emoji="📖"
          />
        ),
      },
      { path: "product/:slug", Component: ProductDetails },
      { path: "search", Component: SearchResults },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success", Component: OrderSuccess },
      { path: "orders", Component: Orders },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "return-policy", Component: ReturnPolicy },
      { path: "terms", Component: TermsConditions },
      { path: "faq", Component: FAQ },
      { path: "about", Component: AboutUs },
      { path: "contact", Component: ContactUs },
      { path: "gallery", Component: Gallery },
      { path: "blog", Component: Blog },
      { path: "blog/:slug", Component: BlogDetails },
      { path: "*", element: <NotFound /> },
      {
        path: "unauthorized",
        element: (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-6xl font-extrabold text-red-400 mb-2">403</p>
              <p className="text-gray-500">
                You don't have permission to view this page.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },

  // Admin — wrapped with AdminRoute
  {
    path: "/panel",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "orders", Component: AdminOrders },
      { path: "users", Component: AdminUsers },
      { path: "profit", Component: ProfitAdmin },
      { path: "gallery", Component: AdminGallery },
      { path: "blog", Component: AdminBlog },
      { path: "pluginadmin", Component: PluginAdmin },
    ],
  },
  {
    path: "/landing",
    Component: LandingPage,
  },
]);

export default router;
