import { useEffect } from "react";
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

const CodingLandingPage = () => {
  useEffect(() => {
    GTM.pageView(location.pathname); // fires once when the page loads
  }, []);

  return (
    <div className="bg-white text-slate-900">
      <CLHero />
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
