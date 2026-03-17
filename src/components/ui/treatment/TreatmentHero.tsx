'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircleIcon, ArrowRightIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface TreatmentHeroProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  duration: string;
  methods: string[];
  conditions: string[];
  ctaText?: string;
  ctaLink?: string;
}

export default function TreatmentHero({
  title,
  subtitle,
  description,
  image,
  gradient,
  duration,
  methods,
  conditions,
  ctaText = "Schedule Consultation",
  ctaLink = "/contact"
}: TreatmentHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-12 sm:py-16 lg:py-24 xl:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}/10`} />
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Content */}
          <div className={`${isVisible ? 'animate-in slide-in-from-left duration-1000' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold mb-6 shadow-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>Specialized Treatment</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl sm:text-2xl md:text-3xl text-slate-600 mb-6 sm:mb-8 leading-relaxed">
              {subtitle}
            </h2>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-10 leading-relaxed">
              {description}
            </p>

            {/* Treatment Details */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8 sm:mb-10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Duration</div>
                  <div className="text-slate-600">{duration}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Approach</div>
                  <div className="text-slate-600">Evidence-Based</div>
                </div>
              </div>
            </div>

            {/* Methods and Conditions */}
            <div className="space-y-4 mb-8 sm:mb-10">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Treatment Methods:</h3>
                <div className="flex flex-wrap gap-2">
                  {methods.map((method) => (
                    <span key={method} className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Conditions Treated:</h3>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition) => (
                    <span key={condition} className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link 
                href={ctaLink}
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {ctaText}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="/treatments" 
                className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:border-blue-600 hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                View All Treatments
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className={`${isVisible ? 'animate-in slide-in-from-right duration-1000 delay-200' : 'opacity-0'}`}>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  priority
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
              </div>
              {/* Decorative elements */}
              <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-30 animate-pulse`} />
              <div className={`absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-40 animate-pulse delay-1000`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
