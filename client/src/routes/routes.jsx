// src/routes/router.jsx
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

// Layouts + guards stay eager — they're small and needed on every navigation.
import RootLayout from "../layout/RootLayout";
import AdminLayout from "../pages/Admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicRoute from "./PublicRoute";
import RouteFallback from "../components/RouteFallback";

// Pages are code-split — each becomes its own chunk that loads on demand,
// so a first-time visitor to the homepage no longer downloads the admin
// dashboard, charts, and every product page up front.
const Home = lazy(() => import("../pages/Home/Home"));
const IslamicBooks = lazy(() => import("../pages/Products/IslamicBooks/IslamicBooks"));
const WallFrame = lazy(() => import("../pages/Products/WallFrame/WallFrame"));
const Attar = lazy(() => import("../pages/Products/Attar/Attar"));
const HajjItem = lazy(() => import("../pages/Products/HajjItem/HajjItem"));
const Kids = lazy(() => import("../pages/Products/Kids/Kids"));
const ProductListPage = lazy(() => import("../pages/Products/ProductListPage"));
const AllProductsGrid = lazy(() => import("../pages/Home/AllProductsGrid"));
const ProductDetails = lazy(() => import("../pages/Products/ProductDetails/ProducDetails"));
const SearchResults = lazy(() => import("../pages/Products/SearchResults"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Cart/Checkout"));
const OrderSuccess = lazy(() => import("../pages/Cart/OrderSuccess"));
const Orders = lazy(() => import("../pages/Orders/Orders"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/Admin/AdminProducts"));
const AdminOrders = lazy(() => import("../pages/Admin/AdminOrders"));
const AdminUsers = lazy(() => import("../pages/Admin/AdminUsers"));
const UserDashboard = lazy(() => import("../pages/Dashboard/UserDashboard"));
const Gallery = lazy(() => import("../pages/gallery/GalleryPage"));
const AdminGallery = lazy(() => import("../pages/Admin/AdminGallery"));
const AdminBlog = lazy(() => import("../pages/Admin/AdminBlog"));
const Blog = lazy(() => import("../pages/Blog/BlogPage"));
const BlogDetails = lazy(() => import("../pages/Blog/BlogDetailPage"));
const NotFound = lazy(() => import("../components/NotFound"));
const PluginAdmin = lazy(() => import("../pages/Admin/PluginAdmin"));
const IslamicProducts = lazy(() => import("../pages/Products/IslamicProducts/IslamicProducts"));
const ReturnPolicy = lazy(() => import("../pages/Info/ReturnPolicy"));
const TermsConditions = lazy(() => import("../pages/Info/TermsConditions"));
const PrivacyPolicy = lazy(() => import("../pages/Info/PrivacyPolicy"));
const AboutUs = lazy(() => import("../pages/Info/AboutUs"));
const ContactUs = lazy(() => import("../pages/Info/ContactUs"));
const FAQ = lazy(() => import("../pages/Info/FAQ"));
const ProfitAdmin = lazy(() => import("../pages/Admin/ProfitAdmin"));
const LandingPage = lazy(() => import("../landing/LandingPage"));

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: AllProductsGrid },
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
    // Standalone route with no layout — needs its own Suspense boundary for the
    // lazily-loaded chunk.
    path: "/landing",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
]);

export default router;
