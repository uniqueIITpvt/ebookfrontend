'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { treatmentsApi, type Treatment } from '@/services/api/treatmentsApi';

interface TreatmentSidebarProps {
  currentPage: string;
}

export default function TreatmentSidebar({ currentPage }: TreatmentSidebarProps) {
  const [mentalHealthTopics, setMentalHealthTopics] = useState<Treatment[]>([]);
  const [generalHealthTopics, setGeneralHealthTopics] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch treatments from API
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setIsLoading(true);
        const response = await treatmentsApi.getAll({ 
          status: 'published',
          active: true 
        });
        
        if (response.success && response.data) {
          const mentalHealth = response.data.filter((t: Treatment) => t.category === 'Mental Health');
          const generalHealth = response.data.filter((t: Treatment) => t.category === 'General Health');
          
          setMentalHealthTopics(mentalHealth);
          setGeneralHealthTopics(generalHealth);
        }
      } catch (err) {
        console.error('Error fetching treatments for sidebar:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  // Determine which category of topics to show based on current page
  const isGeneralHealth = currentPage.includes('general-health') || 
    generalHealthTopics.some(t => currentPage.includes(t.slug));

  const topicsToShow = isGeneralHealth ? generalHealthTopics : mentalHealthTopics;
  const categoryTitle = isGeneralHealth ? 'GENERAL HEALTH TOPICS' : 'MENTAL HEALTH TOPICS';
  
  // Get first treatment from opposite category for switch link
  const firstMentalHealthTreatment = mentalHealthTopics[0];
  const firstGeneralHealthTreatment = generalHealthTopics[0];
  
  // Dynamic color themes based on category
  const colorTheme = isGeneralHealth ? {
    active: 'bg-teal-100 text-teal-700',
    hover: 'hover:text-gray-900 hover:bg-teal-50',
    primaryLink: 'text-teal-600 hover:text-teal-800 hover:bg-teal-50',
    secondaryHover: 'hover:text-gray-700 hover:bg-teal-50'
  } : {
    active: 'bg-blue-100 text-blue-700',
    hover: 'hover:text-gray-900 hover:bg-blue-50',
    primaryLink: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
    secondaryHover: 'hover:text-gray-700 hover:bg-blue-50'
  };

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">{categoryTitle}</h3>
        <nav className="space-y-1">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : topicsToShow.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No treatments available</div>
          ) : (
            topicsToShow.map((topic) => (
              <Link
                key={topic._id}
                href={`/treatments/${topic.slug}`}
                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                  currentPage.includes(topic.slug)
                    ? `${colorTheme.active} font-medium` 
                    : `text-gray-600 ${colorTheme.hover}`
                }`}
              >
                {topic.name}
              </Link>
            ))
          )}
        </nav>
        
        {/* Category Switch Link */}
        <div className="mt-6 pt-4 border-gray-200">
          <Link
            href="/treatments"
            className={`block px-3 py-2 text-sm ${colorTheme.primaryLink} rounded-md transition-colors font-medium`}
          >
            ← Browse All Categories
          </Link>
          {isGeneralHealth ? (
            firstMentalHealthTreatment && (
              <Link
                href={`/treatments/${firstMentalHealthTreatment.slug}`}
                className={`block px-3 py-2 text-sm text-gray-500 ${colorTheme.secondaryHover} rounded-md transition-colors mt-1`}
              >
                View Mental Health Topics
              </Link>
            )
          ) : (
            firstGeneralHealthTreatment && (
              <Link
                href={`/treatments/${firstGeneralHealthTreatment.slug}`}
                className={`block px-3 py-2 text-sm text-gray-500 ${colorTheme.secondaryHover} rounded-md transition-colors mt-1`}
              >
                View General Health Topics
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
