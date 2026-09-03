import React from 'react';
import { Banner } from '../components/common/Banner';
import { Link } from 'react-router-dom';

export const Service = () => {
  const serviceItems = [
    {
      id: '2-jahres-check',
      title: '2-JAHRES-CHECK',
      description: 'Wartungsarbeiten und Reparaturen in unserer Service-Werkstätte',
      image: '/images/service/check.jpg'
    },
    {
      id: 'rettungspacken',
      title: 'RETTUNGSGERÄTE-PACKSERVICE',
      description: 'Rettung professionell gepackt! Wir packen sie, als wäre es unsere eigene.',
      image: '/images/service/rettungspackservice.png'
    },
    {
      id: 'trimmtuning',
      title: 'TRIMMTUNING',
      description: '„Trimmtuning“ – für bessere und sicherere Schirme! Mit professioneller Leinenvermessung und optimaler Einstellung der Leinenlängen mehr erreichen: Idealerweise kann so in der Luft mehr Leistung rausgeholt werden, ohne dass euer Schirm dadurch an Sicherheit verliert oder anspruchsvoller wird.',
      image: '/images/service/trimmtuning.jpg'
    },
    {
      id: 'reparatur',
      title: 'REPARATUR-SERVICE',
      description: 'Defekte an der Ausrüstung? Wir bieten euch einen Reparatur Service für eure Ausrüstung an.',
      image: '/images/service/reparatur.jpg'
    }
  ];

  return (
    <div className="w-full bg-white pb-20">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Main Title */}
        <div className="text-center mb-20 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
            SERVICE
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
        </div>

        <div className="flex flex-col space-y-16 md:space-y-24">
          {serviceItems.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={item.id} id={item.id} className="flex flex-col md:flex-row gap-12 items-stretch scroll-mt-20">
                {/* Image Side */}
                <div className={`w-full md:w-1/2 ${isEven ? 'order-1' : 'order-1 md:order-2'}`}>
                  <div className="relative w-full h-[400px] overflow-hidden group cursor-pointer shadow-lg rounded-sm">
                    <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>

                {/* Text Side */}
                <div className={`w-full md:w-1/2 flex flex-col justify-center ${isEven ? 'order-2' : 'order-2 md:order-1'}`}>
                  <div className={`flex flex-col ${isEven ? 'items-start text-left' : 'items-start md:items-end md:text-right'}`}>
                    <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4 tracking-wide uppercase">
                      {item.title}
                    </h2>
                    <div className="w-16 h-px bg-luxury-gold mb-6"></div>
                    <p className={`text-[15px] text-gray-500 font-light leading-relaxed mb-8 max-w-lg ${isEven ? '' : 'md:mr-0'}`}>
                      {item.description}
                    </p>
                    <Link 
                      to={`/service/${item.id}`} 
                      className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm"
                    >
                      WEITERLESEN
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
