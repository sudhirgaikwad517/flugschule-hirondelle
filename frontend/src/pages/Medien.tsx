import { Banner } from '../components/common/Banner';

export const Medien = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              MEDIEN
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Left Column (Events und Reisen) */}
            <div>
              <h2 className="text-2xl text-gray-700 font-light mb-6">Events und Reisen</h2>
              <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-lg border border-gray-100">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/8KKXgu00pUw" 
                  title="Events und Reisen" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Right Column (Infos rund ums Gleitschirmfliegen) */}
            <div>
              <h2 className="text-2xl text-gray-700 font-light mb-6">Infos rund ums Gleitschirmfliegen</h2>
              <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-lg border border-gray-100">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/GIDODa--gUs" 
                  title="Infos rund ums Gleitschirmfliegen" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
