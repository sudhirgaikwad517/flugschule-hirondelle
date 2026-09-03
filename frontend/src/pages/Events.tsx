import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { useEvents, categoryColors } from '../hooks/useEvents';
import type { Category, CalendarEvent } from '../hooks/useEvents';
import { EventBookingModal } from '../components/events/EventBookingModal';
import { EventDetailsView } from '../components/events/EventDetailsView';

export const Events = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { events, loading } = useEvents();

  // Modals state
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<CalendarEvent | null>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<CalendarEvent | null>(null);

  // Filters State
  const initialCategoryStr = searchParams.get('category');
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    initialCategoryStr ? new Set(initialCategoryStr.split(',') as Category[]) : new Set()
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'future'); // future, past, today, thisMonth, thisYear
  const [feeFilter, setFeeFilter] = useState(searchParams.get('fee') || 'all'); // all, free, paid
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedOrganizers, setSelectedOrganizers] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Sync state to URL
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set('search', searchTerm);
    if (dateFilter && dateFilter !== 'future') newParams.set('date', dateFilter);
    if (feeFilter && feeFilter !== 'all') newParams.set('fee', feeFilter);
    if (selectedCategories.size > 0) newParams.set('category', Array.from(selectedCategories).join(','));
    setSearchParams(newParams, { replace: true });
  }, [searchTerm, dateFilter, feeFilter, selectedCategories, setSearchParams]);

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => {
    const cats = new Set(events.map(e => e.category));
    return Array.from(cats).sort();
  }, [events]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(events.map(e => e.location || 'Online/Standard').filter(Boolean));
    return Array.from(locs).sort();
  }, [events]);

  const uniqueOrganizers = useMemo(() => {
    const orgs = new Set(events.map(e => e.organizer || 'Flugschule Hirondelle').filter(Boolean));
    return Array.from(orgs).sort();
  }, [events]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    events.forEach(e => {
      if (e.tags) {
        e.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }, [events]);

  // Apply Filters
  const filteredEvents = useMemo(() => {
    let result = events;

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(lower) || 
        (e.description && e.description.toLowerCase().includes(lower))
      );
    }

    // Category
    if (selectedCategories.size > 0) {
      result = result.filter(e => selectedCategories.has(e.category));
    }

    // Location
    if (selectedLocations.size > 0) {
      result = result.filter(e => selectedLocations.has(e.location || 'Online/Standard'));
    }

    // Organizer
    if (selectedOrganizers.size > 0) {
      result = result.filter(e => selectedOrganizers.has(e.organizer || 'Flugschule Hirondelle'));
    }

    // Tags
    if (selectedTags.size > 0) {
      result = result.filter(e => {
        if (!e.tags) return false;
        const eTags = e.tags.split(',').map(t => t.trim());
        return Array.from(selectedTags).some(t => eTags.includes(t));
      });
    }

    // Fees
    if (feeFilter === 'free') {
      result = result.filter(e => !e.tickets || e.tickets.length === 0 || e.tickets.every(t => t.price === 0));
    } else if (feeFilter === 'paid') {
      result = result.filter(e => e.tickets && e.tickets.some(t => t.price > 0));
    }

    // Dates
    const now = new Date();
    const todayStr = now.toDateString();
    
    if (dateFilter === 'future') {
      result = result.filter(e => e.end >= now || e.start.toDateString() === todayStr);
    } else if (dateFilter === 'past') {
      result = result.filter(e => e.end < now && e.start.toDateString() !== todayStr);
    } else if (dateFilter === 'today') {
      result = result.filter(e => e.start.toDateString() === todayStr);
    } else if (dateFilter === 'thisMonth') {
      result = result.filter(e => e.start.getMonth() === now.getMonth() && e.start.getFullYear() === now.getFullYear());
    } else if (dateFilter === 'thisYear') {
      result = result.filter(e => e.start.getFullYear() === now.getFullYear());
    }

    // Sort by date ascending
    result.sort((a, b) => a.start.getTime() - b.start.getTime());

    return result;
  }, [events, searchTerm, selectedCategories, selectedLocations, selectedOrganizers, selectedTags, feeFilter, dateFilter]);

  // Handlers for Checkboxes
  const toggleSet = (set: Set<any>, value: any, setter: React.Dispatch<React.SetStateAction<Set<any>>>) => {
    const newSet = new Set(set);
    if (newSet.has(value)) newSet.delete(value);
    else newSet.add(value);
    setter(newSet);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Banner />

      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTER */}
        <div className="w-full md:w-1/4 flex-shrink-0 print:hidden">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Filter</h2>
            
            {/* View Switch */}
            <div className="mb-4">
              <button
                onClick={() => navigate('/buchungskalender')}
                className="w-full bg-blue-50 text-blue-700 font-semibold py-2 rounded-md hover:bg-blue-100 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Zum Kalender wechseln
              </button>
            </div>

            {/* Calendar file download + print */}
            <div className="mb-6 flex gap-2">
              <a
                href="/api/events/ics"
                className="flex-1 bg-gray-50 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Kalender
              </a>
              <button
                onClick={() => window.print()}
                className="bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition flex items-center justify-center"
                title="Liste drucken"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </button>
              <a
                href="/api/events/rss"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition flex items-center justify-center"
                title="RSS-Feed abonnieren"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a14 14 0 0114 14M5 12a7 7 0 017 7" /><circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>
              </a>
            </div>

            {/* Search */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Suche</h3>
              <input 
                type="text" 
                placeholder="Nach Events suchen..." 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Datum</h3>
              <select 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="future">Zukünftige Events</option>
                <option value="today">Heute</option>
                <option value="thisMonth">Diesen Monat</option>
                <option value="thisYear">Dieses Jahr</option>
                <option value="past">Vergangene Events</option>
                <option value="all">Alle</option>
              </select>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Kategorien</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(categoryColors).filter(cat => cat !== 'ALLE ANZEIGEN').sort().map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={selectedCategories.has(cat as Category)}
                        onChange={() => toggleSet(selectedCategories, cat as Category, setSelectedCategories)}
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

            {/* Fees */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Gebühren</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="fee" value="all" checked={feeFilter === 'all'} onChange={(e) => setFeeFilter(e.target.value)} className="text-blue-600" />
                  <span className="text-sm text-gray-700">Alle</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="fee" value="free" checked={feeFilter === 'free'} onChange={(e) => setFeeFilter(e.target.value)} className="text-blue-600" />
                  <span className="text-sm text-gray-700">Kostenlos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="fee" value="paid" checked={feeFilter === 'paid'} onChange={(e) => setFeeFilter(e.target.value)} className="text-blue-600" />
                  <span className="text-sm text-gray-700">Kostenpflichtig</span>
                </label>
              </div>
            </div>

            {/* Locations */}
            {uniqueLocations.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Veranstaltungsorte</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueLocations.map(loc => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={selectedLocations.has(loc)}
                        onChange={() => toggleSet(selectedLocations, loc, setSelectedLocations)}
                      />
                      <span className="text-sm text-gray-700">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Organizers */}
            {uniqueOrganizers.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Veranstalter</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueOrganizers.map(org => (
                    <label key={org} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={selectedOrganizers.has(org)}
                        onChange={() => toggleSet(selectedOrganizers, org, setSelectedOrganizers)}
                      />
                      <span className="text-sm text-gray-700">{org}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {uniqueTags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleSet(selectedTags, tag, setSelectedTags)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.has(tag) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* MAIN LIST VIEW */}
        <div className="w-full md:w-3/4">
          {/* Header */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">
              <span className="font-bold text-blue-600 mr-2">{filteredEvents.length}</span> 
              Ergebnis(se) gefunden
            </h2>
            <div className="text-sm text-gray-500">
              Sortiert nach: <span className="font-semibold">Datum aufsteigend</span>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-20 text-gray-500">Events werden geladen...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Keine Events gefunden</h3>
              <p className="text-gray-500">Bitte passe deine Filter an, um mehr Ergebnisse zu sehen.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategories(new Set());
                  setSelectedLocations(new Set());
                  setSelectedOrganizers(new Set());
                  setSelectedTags(new Set());
                  setDateFilter('future');
                  setFeeFilter('all');
                }}
                className="mt-6 text-blue-600 hover:underline font-medium"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map(event => {
                const colorObj = categoryColors[event.category] || categoryColors['Sonstiges'];
                
                // Calculate spaces
                const totalCapacity = event.maxParticipants || 0;
                const totalBooked = event.tickets?.reduce((sum, t) => sum + (t.bookedCount || 0), 0) || 0;
                const spacesLeft = Math.max(0, totalCapacity - totalBooked);
                
                const validPrices = (event.tickets || []).map(t => t.price).filter(p => p > 0);
                let minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

                return (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row">
                    {/* Image / Date block */}
                    <div className="sm:w-1/3 md:w-1/4 flex-shrink-0 relative h-48 sm:h-auto bg-gray-100">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl.startsWith('http') ? event.imageUrl : `${event.imageUrl}`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                            e.currentTarget.parentElement!.innerHTML += `<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="absolute top-0 left-0 bg-white bg-opacity-90 px-3 py-2 text-center rounded-br-lg shadow-sm">
                        <div className="text-xs font-bold text-gray-500 uppercase">{event.start.toLocaleDateString('de-DE', { month: 'short' })}</div>
                        <div className="text-2xl font-black text-gray-800">{event.start.getDate()}</div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 sm:w-2/3 md:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span 
                              className="inline-block px-2 py-1 text-xs font-semibold rounded mb-2"
                              style={{ backgroundColor: colorObj.bg, color: colorObj.text }}
                            >
                              {event.category}
                            </span>
                            {event.cancelled && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ml-2 bg-red-100 text-red-700">
                                Storniert
                              </span>
                            )}
                            <h3 className={`text-xl font-bold text-gray-900 ${event.cancelled ? 'line-through opacity-60' : ''}`}>{event.title}</h3>
                          </div>
                          <div className="text-right">
                            <span className="block text-lg font-bold text-gray-900">
                              {minPrice > 0 ? `${validPrices.length > 1 ? 'ab ' : ''}€ ${minPrice.toFixed(2)}` : 'Kostenlos'}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {event.description?.replace(/<[^>]*>?/gm, '') || 'Keine Beschreibung verfügbar.'}
                        </p>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {event.start.toLocaleDateString('de-DE')} {event.end > event.start && `- ${event.end.toLocaleDateString('de-DE')}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {event.organizer || 'Flugschule Hirondelle'}
                          </div>
                        </div>
                      </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
                          <div className="flex items-center gap-2">
                            {event.cancelled ? (
                              <>
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm font-medium text-red-700">Storniert</span>
                              </>
                            ) : totalCapacity > 0 ? (
                              <>
                                <div className={`w-3 h-3 rounded-full ${spacesLeft > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium text-gray-700">
                                  {spacesLeft > 0 ? `${spacesLeft} Plätze frei` : 'Ausgebucht (Warteliste)'}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium text-gray-700">Unbegrenzte Plätze</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => navigate(`/buchungskalender/${event.id}`)}
                              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
                            >
                              Buchen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedEventForBooking && (
        <EventBookingModal
          isOpen={true}
          event={selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
        />
      )}

      {/* Details Modal */}
      {selectedEventForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-1 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <button 
                onClick={() => setSelectedEventForDetails(null)}
                className="text-gray-500 hover:text-gray-700 p-3 ml-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <EventDetailsView 
              event={selectedEventForDetails} 
              onBack={() => setSelectedEventForDetails(null)}
              onBook={() => {
                setSelectedEventForDetails(null);
                setSelectedEventForBooking(selectedEventForDetails);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
