import { useEffect } from "react";
import { Link } from "react-router";
import { GTM } from "../utils/gtm";
import CLHero from "./CLHero";
import CLProblem from "./CLProblem";
import CLIntro from "./CLIntro";
import CLSubjects from "./CLSubjects";
import CLBenefits from "./CLBenefits";
import CLCompare from "./CLCompare";
import CLVideo from "./CLVideo";
import CLPrize from "./CLPrize";
import CLPackage from "./CLPackage";
import CLReviews from "./CLReviews";
import CLFAQ from "./CLFAQ";
import CLPrice from "./CLPrice";
import CLPhoneOrder from "./CLPhoneOrder";
import CodingOrderForm from "./CodingOrderForm";
import Copyright from "./Copyright";
import coverImg from "./assets/landingcover.webp";
import logo from "../assets/SalamBDLogo.png";

const scrollToOrder = () =>
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });

const CodingLandingPage = () => {
  useEffect(() => {
    GTM.pageView(location.pathname); // fires once when the page loads
  }, []);

  return (
    <div className="bg-white text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-emerald-900/10 shadow-lg shadow-emerald-900/5">
        <div className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src={logo} alt="Salam BD Logo" className="h-10 md:h-14 w-auto" />
          </Link>
          <button
            onClick={scrollToOrder}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm md:text-base px-5 py-2 md:px-6 md:py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-emerald-900/20 hover:scale-105"
          >
            অর্ডার করুন
          </button>
        </div>
      </nav>
      <div className="w-full overflow-hidden">
        <img
          src={coverImg}
          alt="Salam Coding Book Cover"
          className="w-full h-auto object-cover"
        />
      </div>
      {/* <CLHero /> */}
       <CLVideo />
      <CLProblem />
      <CLIntro />
      <CLSubjects />
      <CLBenefits />
      <CLCompare />
      <CLPrize />
      <CLPackage />
      {/* <CLReviews /> */}
      <CLFAQ />
      <CLPrice />
      {/* <CLPhoneOrder /> */}
      <CodingOrderForm />
      <Copyright />
    </div>
  );
};

export default CodingLandingPage;
