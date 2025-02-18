import AstroLogo from "../logos/AstroLogo";
import OpenAILogo from "../logos/OpenAILogo";
import PrismaLogo from "../logos/PrismaLogo";
import SalesforceLogo from "../logos/SalesforceLogo";

export default function Clients() {
  return (
    <div className='mt-12 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-between gap-y-6'>
      <h2 className='mb-6 text-center font-semibold tracking-wide text-gray-500 dark:text-white'>
        Built with / Used by:
      </h2>

      <div className='mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl md:grid-cols-4 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none'>
        {
          [<SalesforceLogo />, <PrismaLogo />, <AstroLogo />, <OpenAILogo />].map((logo, index) => (
            <div key={index} className='flex justify-center col-span-1 max-h-12 w-full object-contain dark:opacity-80'>
              {logo}
            </div>
          ))
        }
      </div>
    </div>
  )
}
