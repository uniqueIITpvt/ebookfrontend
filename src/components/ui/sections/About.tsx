'use client';

import { useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  HeartIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,

  BeakerIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface Achievement {
  year: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
}

interface Qualification {
  degree: string;
  institution: string;
  year: string;
  description: string;
}

interface Specialization {
  name: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
  experience: string;
}

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(
    null
  );

  const stats = [
    {
      number: '700+',
      label: 'Resources Shared',
      color: 'text-blue-600',
      description:
        'Books, audiobooks, and learning materials shared with readers and learners',
    },
    {
      number: '5+',
      label: 'Years of Work',
      color: 'text-indigo-600',
      description:
        'Sustained focus on research, publishing, and knowledge-sharing initiatives',
    },
    {
      number: 'Same Day',
      label: 'Fast Access',
      color: 'text-emerald-600',
      description: 'Quick access to curated resources and updates as they are published',
    },
    {
      number: '3',
      label: 'Core Areas',
      color: 'text-purple-600',
      description: 'Books, audiobooks, and blogs focused on learning and research content',
    },
  ];

  const achievements: Achievement[] = [
    {
      year: '2017',
      title: 'Launched the Library',
      description:
        'Started publishing curated books and audiobook resources for continuous learning',
      icon: TrophyIcon,
      color: 'text-yellow-600',
    },
    {
      year: '2018',
      title: 'Expanded Audio Resources',
      description: 'Introduced audiobook-focused collections to support learning on the go',
      icon: HeartIcon,
      color: 'text-red-600',
    },
    {
      year: '2016',
      title: 'Research & Curation Workflow',
      description: 'Established a consistent review and curation process for quality resources',
      icon: ShieldCheckIcon,
      color: 'text-blue-600',
    },
    {
      year: '2006',
      title: 'Long-Term Knowledge Work',
      description: 'Built years of experience turning complex topics into clear learning materials',
      icon: UserGroupIcon,
      color: 'text-green-600',
    },
    {
      year: '2006',
      title: 'Foundational Research Focus',
      description: 'Committed to research-driven publishing and accessible education resources',
      icon: AcademicCapIcon,
      color: 'text-indigo-600',
    },
  ];

  const qualifications: Qualification[] = [
    {
      degree: 'Content Curation & Review',
      institution: 'uniqueIIT Research Center',
      year: '2004-2006',
      description:
        'Structured process to select, review, and present high-quality learning resources',
    },
    {
      degree: 'Research-Driven Publishing',
      institution: 'uniqueIIT Research Center',
      year: '2001-2004',
      description: 'Creating clear summaries and resource collections grounded in research',
    },
    {
      degree: 'Learning Resource Development',
      institution: 'uniqueIIT Research Center',
      year: '2001',
      description: 'Developing practical learning materials for students and professionals',
    },
  ];

  const specializations: Specialization[] = [
    {
      name: 'Audiobooks',
      description: 'Listen and learn with curated audio resources',
      icon: ClockIcon,
      color: 'text-blue-600',
      experience: 'Updated weekly',
    },
    {
      name: 'Books',
      description: 'Curated reading resources for structured learning',
      icon: UserGroupIcon,
      color: 'text-indigo-600',
      experience: 'Growing catalog',
    },
    {
      name: 'Summaries & Notes',
      description: 'Concise takeaways to reinforce key concepts',
      icon: HeartIcon,
      color: 'text-green-600',
      experience: 'Research-led',
    },
    {
      name: 'Blog & Articles',
      description: 'Insights and reading guides to support continuous learning',
      icon: ShieldCheckIcon,
      color: 'text-purple-600',
      experience: 'Regular posts',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserGroupIcon },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
    { id: 'qualifications', label: 'Qualifications', icon: AcademicCapIcon },
    { id: 'specializations', label: 'Specializations', icon: BeakerIcon },
  ];

  return (
    <section className='py-4 sm:py-8 lg:py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0 opacity-30'>
        <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/50 via-transparent to-indigo-100/50'></div>
        <div className='absolute top-20 right-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-500'></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6'>
            <CheckCircleIcon className='w-4 h-4 mr-2' />
            About UniqueIIT Research Center
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6'>
            Dedicated to{' '}
            <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
              Research & Learning
            </span>
          </h2>
          <p className='text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed'>
            Research-driven resources, publications, and learning materials designed to support students and professionals.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className='flex flex-wrap justify-center gap-2 mb-12'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-blue-100 hover:border-blue-200'
              }`}
            >
              <tab.icon className='w-4 h-4 mr-2' />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'overview' && (
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            {/* Left Content */}
            <div className='space-y-8'>
              <div className='space-y-6 text-lg text-slate-600 leading-relaxed'>
                <p>
                  UniqueIIT Research Center provides learning resources, publications, and research-driven content.
                </p>
                <p>
                  Our goal is to make high-quality knowledge accessible and practical for students and professionals.
                </p>
                <p>
                  We focus on curated books, audiobooks, and blogs to support continuous learning.
                </p>
              </div>

              {/* Credentials */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex items-center text-slate-700 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300'>
                  <div className='p-2 bg-green-100 rounded-xl mr-4'>
                    <CheckCircleIcon className='w-5 h-5 text-green-600' />
                  </div>
                  <span className='font-semibold'>
                    Research-Led Publications
                  </span>
                </div>
                <div className='flex items-center text-slate-700 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300'>
                  <div className='p-2 bg-blue-100 rounded-xl mr-4'>
                    <ClockIcon className='w-5 h-5 text-blue-600' />
                  </div>
                  <span className='font-semibold'>18+ Years Experience</span>
                </div>
                <div className='flex items-center text-slate-700 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300'>
                  <div className='p-2 bg-indigo-100 rounded-xl mr-4'>
                    <UserGroupIcon className='w-5 h-5 text-indigo-600' />
                  </div>
                  <span className='font-semibold'>Community Learning</span>
                </div>
                <div className='flex items-center text-slate-700 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300'>
                  <div className='p-2 bg-yellow-100 rounded-xl mr-4'>
                    <TrophyIcon className='w-5 h-5 text-yellow-600' />
                  </div>
                  <span className='font-semibold'>Curated Resources</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <a
                  href='/about'
                  className='inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
                >
                  Learn More About UniqueIIT Research Center
                  <ArrowRightIcon className='w-5 h-5 ml-2' />
                </a>
                <Link
                  href='/books'
                  className='inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-200'
                >
                  View Publications
                </Link>
              </div>
            </div>

            {/* Right Stats Card */}
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-3xl opacity-20 transform rotate-6'></div>
              <div className='relative bg-white p-8 rounded-3xl shadow-2xl'>
                <div className='grid grid-cols-2 gap-6'>
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className='text-center group cursor-pointer'
                    >
                      <div
                        className={`text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {stat.number}
                      </div>
                      <div className='text-slate-600 font-medium mb-2'>
                        {stat.label}
                      </div>
                      <div className='text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        {stat.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className='max-w-4xl mx-auto'>
            <div className='space-y-6'>
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    selectedAchievement === achievement.year
                      ? 'ring-2 ring-blue-500/30 scale-105'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedAchievement(
                      selectedAchievement === achievement.year
                        ? null
                        : achievement.year
                    )
                  }
                >
                  <div className='flex items-start gap-6'>
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 ${achievement.color}`}
                    >
                      <achievement.icon className='w-8 h-8' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 mb-3'>
                        <span className='text-2xl font-bold text-slate-900'>
                          {achievement.title}
                        </span>
                        <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold'>
                          {achievement.year}
                        </span>
                      </div>
                      <p className='text-slate-600 leading-relaxed'>
                        {achievement.description}
                      </p>
                      {selectedAchievement === achievement.year && (
                        <div className='mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100'>
                          <p className='text-sm text-slate-700'>
                            This achievement represents a significant milestone
                            for our work, demonstrating our commitment to
                            excellence and innovation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications Tab */}
        {activeTab === 'qualifications' && (
          <div className='max-w-4xl mx-auto'>
            <div className='space-y-6'>
              {qualifications.map((qual, index) => (
                <div
                  key={index}
                  className='bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300'
                >
                  <div className='flex items-start gap-6'>
                    <div className='p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100'>
                      <AcademicCapIcon className='w-8 h-8 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 mb-3'>
                        <h3 className='text-2xl font-bold text-slate-900'>
                          {qual.degree}
                        </h3>
                        <span className='bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold'>
                          {qual.year}
                        </span>
                      </div>
                      <p className='text-lg text-blue-600 font-semibold mb-2'>
                        {qual.institution}
                      </p>
                      <p className='text-slate-600 leading-relaxed'>
                        {qual.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specializations Tab */}
        {activeTab === 'specializations' && (
          <div className='grid md:grid-cols-2 gap-8'>
            {specializations.map((spec, index) => (
              <div
                key={index}
                className='bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
              >
                <div className='flex items-start gap-6'>
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 ${spec.color}`}
                  >
                    <spec.icon className='w-8 h-8' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-3'>
                      <h3 className='text-xl font-bold text-slate-900'>
                        {spec.name}
                      </h3>
                      <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold'>
                        {spec.experience}
                      </span>
                    </div>
                    <p className='text-slate-600 leading-relaxed'>
                      {spec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Information */}
        <div className='mt-16 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200 shadow-lg'>
          <div className='text-center mb-8'>
            <h3 className='text-2xl font-bold text-slate-900 mb-4'>
              Ready to Explore More?
            </h3>
            <p className='text-slate-600'>
              Get in touch to ask questions, request recommendations, or suggest new books and audiobooks.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-6'>
            <div className='flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100'>
              <PhoneIcon className='w-6 h-6 text-blue-600' />
              <div>
                <div className='font-semibold text-slate-900'>Call (Optional)</div>
                <div className='text-slate-600 text-sm'>+19 (555) 123-456</div>
              </div>
            </div>
            <div className='flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100'>
              <EnvelopeIcon className='w-6 h-6 text-indigo-600' />
              <div>
                <div className='font-semibold text-slate-900'>Email</div>
                <div className='text-slate-600 text-sm'>
                  contact@uniqueiit-research-center.example
                </div>
              </div>
            </div>
            <div className='flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100'>
              <CalendarIcon className='w-6 h-6 text-green-600' />
              <div>
                <div className='font-semibold text-slate-900'>Explore</div>
                <div className='text-slate-600 text-sm'>Browse the Library</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
