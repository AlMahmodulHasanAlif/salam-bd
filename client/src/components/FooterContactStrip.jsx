import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

export default function FooterContactStrip() {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 mt-9 ">
      <div className="bg-[#1a6b3a] rounded-2xl shadow-xl py-8 px-8 grid md:grid-cols-3 gap-8 text-white">

        {/* Address */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 aspect-square rounded-full bg-white flex items-center justify-center text-primary text-[30px]">
            <MdLocationOn />
          </div>

          <div>
            <p className="text-sm text-white/70">Address</p>
            <p className="font-semibold text-sm leading-snug">
              37 Ma Amena Plaza, (6th floor of Sundarban Courier), falpatti area,
              Mirpur-10, Dhaka-1216
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 aspect-square rounded-full bg-white flex items-center justify-center text-primary text-[20px]">
            <MdEmail />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-white/70">Send Email</p>
            <p className="font-semibold text-base sm:text-lg break-all">
              salambd.contact@gmail.com
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 aspect-square rounded-full bg-white flex items-center justify-center text-primary text-xl">
            <MdPhone />
          </div>

          <div>
            <p className="text-sm text-white/70">Call Us</p>
            <p className="font-semibold text-lg">
              01886699883
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
