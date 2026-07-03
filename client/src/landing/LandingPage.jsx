import { Phone } from "lucide-react";
import Lfeature from "./Lfeature";
import Lgift from "./Lgift";
import Lhero from "./Lhero";
import LSlider from "./Lslider";
import LVideo from "./Lvideo";
import OurPlugin from "./Ourplugin";
import Usage from "./Usage";
import PhoneOrder from "./PhoneOrder";
import PluginOrderForm from "./PluginOrderForm";
import Copyright from "./CopyRight";
import Water from "./water";
import { useEffect } from "react";
import { GTM } from '../utils/gtm';



const LandingPage = () => {
useEffect(() => {
  GTM.pageView(location.pathname); // fires once when the page loads
}, []);

  
  return (
    <div className="bg-[#0a0a0a] text-white">
      <Lhero />
   
      <Lfeature />
      <Lgift />
      {/* <Water /> */}
      <OurPlugin />
      <Usage />
      <PhoneOrder />
      {/* <LVideo /> */}
      <PluginOrderForm />
      <Copyright/>
    </div>
  );
};
export default LandingPage;
