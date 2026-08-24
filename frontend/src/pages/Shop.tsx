import React, { useState } from 'react';
import { Banner } from '../components/common/Banner';
import { Search, User, Package, ShoppingBag, Gift } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  lowest30Days?: string;
  badge?: {
    text: string;
    type: 'sale' | 'soldout' | 'new';
  };
  brand?: string;
}

const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wertgutschein',
    image: 'https://picsum.photos/id/1018/400/400',
    price: '100,00€',
  },
  {
    id: '2',
    name: 'Kursgutschein',
    image: 'https://picsum.photos/id/1025/400/400',
    price: '149,00€',
  },
  {
    id: '3',
    name: 'Naviter Oudie N Fanet+',
    image: 'https://picsum.photos/id/1026/400/400',
    price: '979,00€',
    originalPrice: '1.080,91€',
    savings: '9%',
    lowest30Days: '1.080,91€',
    badge: { text: 'AUSVERKAUFT', type: 'soldout' }
  },
  {
    id: '4',
    name: 'Naviter Omni',
    image: 'https://picsum.photos/id/1035/400/400',
    price: '724,90€',
    originalPrice: '783,41€',
    savings: '7%',
    badge: { text: 'SONDERPREIS', type: 'sale' }
  },
  {
    id: '5',
    name: 'Liberpee urinella - inkl. Lagerbeutel',
    image: 'https://picsum.photos/id/1040/400/400',
    price: '19,95€',
    badge: { text: 'neu', type: 'new' }
  },
  {
    id: '6',
    name: 'SKYTRAXX 5 Vario',
    image: 'https://picsum.photos/id/1050/400/400',
    price: '625,00€',
    originalPrice: '649,00€',
    savings: '4%',
    lowest30Days: '599,00€',
    badge: { text: 'SONDERPREIS', type: 'sale' }
  },
  {
    id: '7',
    name: 'Madenburg - Herren Premiumshirt',
    image: 'https://picsum.photos/id/1060/400/400',
    price: '28,95€',
    badge: { text: 'AUSVERKAUFT', type: 'soldout' }
  },
  {
    id: '8',
    name: 'Madenburg - Damen Premiumshirt',
    image: 'https://picsum.photos/id/1070/400/400',
    price: '28,95€',
    badge: { text: 'AUSVERKAUFT', type: 'soldout' }
  },
  {
    id: '9',
    name: 'Bandana HIRONDELLE',
    image: 'https://picsum.photos/id/1080/400/400',
    price: '6,90€',
    brand: 'Hirondelle'
  }
];

export const Shop = () => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Wir empfehlen');

  const sortOptions = [
    'Wir empfehlen',
    'Frisch eingetroffen',
    'Preis aufsteigend',
    'Preis absteigend',
    'Bezeichnung: A bis Z',
    'Bezeichnung: Z bis A'
  ];

  return (
    <div className="w-full bg-[#FAF9F7] pb-20 min-h-screen">
      <Banner />

      <div className="container mx-auto px-4 max-w-[1200px] mt-8 mb-4">
        {/* Main Title */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
            SHOP
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6 mb-10">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96 group">
            <input 
              type="text" 
              placeholder="Produkte suchen" 
              className="w-full border-b border-gray-300 bg-transparent py-3 pl-10 pr-4 text-[14px] font-light text-gray-700 focus:outline-none focus:border-luxury-gold transition-colors"
            />
            <Search className="absolute left-2 top-3 w-5 h-5 text-gray-400 group-focus-within:text-luxury-gold transition-colors" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative text-sm text-gray-700">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 hover:text-luxury-gold uppercase text-[11px] font-bold tracking-widest transition-colors duration-300"
            >
              ORDNEN NACH
              <svg className={`w-4 h-4 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 shadow-xl z-50 rounded-sm overflow-hidden">
                {sortOptions.map((option) => (
                  <button 
                    key={option}
                    onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                    className={`block w-full text-left px-5 py-3 hover:bg-luxury-light hover:text-luxury-gold transition-colors font-light text-[14px] ${sortBy === option ? 'text-luxury-gold bg-luxury-light font-medium' : 'text-gray-600'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-24">
          {DUMMY_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 relative p-6 flex flex-col items-center text-center group">
              
              {/* Badges */}
              {product.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 text-[9px] font-bold uppercase tracking-widest z-10
                  ${product.badge.type === 'soldout' ? 'bg-luxury-slate text-white' : ''}
                  ${product.badge.type === 'sale' ? 'bg-luxury-gold text-white' : ''}
                  ${product.badge.type === 'new' ? 'bg-transparent border border-luxury-gold text-luxury-gold' : ''}
                `}>
                  {product.badge.text}
                </div>
              )}

              {/* Product Image */}
              <div className="w-full h-56 mb-6 overflow-hidden flex items-center justify-center relative">
                <img src={product.image} alt={product.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-grow w-full justify-between items-center">
                <div className="flex flex-col items-center">
                  <h3 className="font-luxury text-xl text-luxury-dark mb-4 group-hover:text-luxury-gold transition-colors duration-300">{product.name}</h3>
                  
                  {product.originalPrice && (
                    <div className="text-[12px] text-gray-400 mb-1 font-light">
                      früher <span className="line-through">{product.originalPrice}</span> | sparen {product.savings}
                    </div>
                  )}
                  
                  <div className="text-xl font-luxury text-luxury-dark mb-2">
                    {product.price}
                  </div>
                  
                  {product.lowest30Days && (
                    <div className="text-[11px] text-gray-400 mb-2 font-light">
                      30-Tage Bestpreis: {product.lowest30Days}
                    </div>
                  )}
                  
                  <div className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider">
                    inkl. MwSt. <a href="#" className="text-luxury-gold hover:underline ml-1">zzgl. Versand</a>
                  </div>
                  
                  {product.brand && (
                    <div className="text-[11px] text-gray-500 font-light border-t border-gray-100 pt-2 w-full">
                      Marke: <span className="font-medium text-luxury-slate">{product.brand}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 pt-10 pb-16 border-t border-gray-200">
          <a href="#" className="flex flex-col items-center gap-4 text-gray-500 hover:text-luxury-gold transition-colors duration-300 group">
            <User className="w-8 h-8 font-light" strokeWidth={1} />
            <span className="text-[12px] uppercase tracking-widest text-center w-32 font-semibold">Benutzerkonto</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-4 text-gray-500 hover:text-luxury-gold transition-colors duration-300 group">
            <Package className="w-8 h-8 font-light" strokeWidth={1} />
            <span className="text-[12px] uppercase tracking-widest text-center w-32 font-semibold">Bestellungen</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-4 text-gray-500 hover:text-luxury-gold transition-colors duration-300 group">
            <ShoppingBag className="w-8 h-8 font-light" strokeWidth={1} />
            <span className="text-[12px] uppercase tracking-widest text-center w-32 font-semibold">Warenkorb</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-4 text-gray-500 hover:text-luxury-gold transition-colors duration-300 group">
            <Gift className="w-8 h-8 font-light" strokeWidth={1} />
            <span className="text-[12px] uppercase tracking-widest text-center w-32 font-semibold">Gutscheine</span>
          </a>
        </div>
      </div>
    </div>
  );
};
