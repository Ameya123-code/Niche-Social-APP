'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Mail, Lock, Phone, User, Upload, ArrowRight,
  Eye, EyeOff, ChevronLeft, Heart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Silk from '@/components/Silk';

/* ─────────────────────────────────────────────
   Floating-label input
───────────────────────────────────────────── */
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  placeholder?: string;
  autoComplete?: string;
  suffix?: React.ReactNode;
}

function InputField({
  label, type, value, onChange, icon: Icon,
  placeholder, autoComplete, suffix,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lifted = focused || value.length > 0;

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.to(wrapRef.current, {
      boxShadow: focused
        ? '0 0 0 1.5px rgba(251,113,133,0.42)'
        : '0 0 0 0px rgba(251,113,133,0)',
      duration: 0.25,
      ease: 'power2.out',
    });
  }, [focused]);

  return (
    <div
      ref={wrapRef}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors duration-200 ${
        focused ? 'border-rose-400/50 bg-white/[0.08]' : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${focused ? 'text-rose-300' : 'text-white/30'}`} />
      <div className="flex-1 relative pt-4 pb-0.5">
        <label className={`absolute left-0 pointer-events-none font-medium transition-all duration-200 ${
          lifted ? 'top-0 text-[10px] text-rose-300' : 'top-2 text-sm text-white/40'
        }`}>
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused && !value ? placeholder : ''}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-white text-sm outline-none placeholder-white/20"
        />
      </div>
      {suffix && <div className="flex-shrink-0">{suffix}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type AuthFormState = {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  birthDate: string;
  profileImageUrl: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

const COUNTRY_DIAL_CODES: Array<{ iso: string; name: string; dial: string }> = [
  { iso: 'AF', name: 'Afghanistan', dial: '+93' },
  { iso: 'AL', name: 'Albania', dial: '+355' },
  { iso: 'DZ', name: 'Algeria', dial: '+213' },
  { iso: 'AS', name: 'American Samoa', dial: '+1-684' },
  { iso: 'AD', name: 'Andorra', dial: '+376' },
  { iso: 'AO', name: 'Angola', dial: '+244' },
  { iso: 'AI', name: 'Anguilla', dial: '+1-264' },
  { iso: 'AG', name: 'Antigua and Barbuda', dial: '+1-268' },
  { iso: 'AR', name: 'Argentina', dial: '+54' },
  { iso: 'AM', name: 'Armenia', dial: '+374' },
  { iso: 'AW', name: 'Aruba', dial: '+297' },
  { iso: 'AU', name: 'Australia', dial: '+61' },
  { iso: 'AT', name: 'Austria', dial: '+43' },
  { iso: 'AZ', name: 'Azerbaijan', dial: '+994' },
  { iso: 'BS', name: 'Bahamas', dial: '+1-242' },
  { iso: 'BH', name: 'Bahrain', dial: '+973' },
  { iso: 'BD', name: 'Bangladesh', dial: '+880' },
  { iso: 'BB', name: 'Barbados', dial: '+1-246' },
  { iso: 'BY', name: 'Belarus', dial: '+375' },
  { iso: 'BE', name: 'Belgium', dial: '+32' },
  { iso: 'BZ', name: 'Belize', dial: '+501' },
  { iso: 'BJ', name: 'Benin', dial: '+229' },
  { iso: 'BM', name: 'Bermuda', dial: '+1-441' },
  { iso: 'BT', name: 'Bhutan', dial: '+975' },
  { iso: 'BO', name: 'Bolivia', dial: '+591' },
  { iso: 'BA', name: 'Bosnia and Herzegovina', dial: '+387' },
  { iso: 'BW', name: 'Botswana', dial: '+267' },
  { iso: 'BR', name: 'Brazil', dial: '+55' },
  { iso: 'VG', name: 'British Virgin Islands', dial: '+1-284' },
  { iso: 'BN', name: 'Brunei', dial: '+673' },
  { iso: 'BG', name: 'Bulgaria', dial: '+359' },
  { iso: 'BF', name: 'Burkina Faso', dial: '+226' },
  { iso: 'BI', name: 'Burundi', dial: '+257' },
  { iso: 'KH', name: 'Cambodia', dial: '+855' },
  { iso: 'CM', name: 'Cameroon', dial: '+237' },
  { iso: 'CA', name: 'Canada', dial: '+1' },
  { iso: 'CV', name: 'Cape Verde', dial: '+238' },
  { iso: 'KY', name: 'Cayman Islands', dial: '+1-345' },
  { iso: 'CF', name: 'Central African Republic', dial: '+236' },
  { iso: 'TD', name: 'Chad', dial: '+235' },
  { iso: 'CL', name: 'Chile', dial: '+56' },
  { iso: 'CN', name: 'China', dial: '+86' },
  { iso: 'CO', name: 'Colombia', dial: '+57' },
  { iso: 'KM', name: 'Comoros', dial: '+269' },
  { iso: 'CG', name: 'Congo', dial: '+242' },
  { iso: 'CD', name: 'Congo (DRC)', dial: '+243' },
  { iso: 'CK', name: 'Cook Islands', dial: '+682' },
  { iso: 'CR', name: 'Costa Rica', dial: '+506' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225' },
  { iso: 'HR', name: 'Croatia', dial: '+385' },
  { iso: 'CU', name: 'Cuba', dial: '+53' },
  { iso: 'CW', name: 'Curaçao', dial: '+599' },
  { iso: 'CY', name: 'Cyprus', dial: '+357' },
  { iso: 'CZ', name: 'Czechia', dial: '+420' },
  { iso: 'DK', name: 'Denmark', dial: '+45' },
  { iso: 'DJ', name: 'Djibouti', dial: '+253' },
  { iso: 'DM', name: 'Dominica', dial: '+1-767' },
  { iso: 'DO', name: 'Dominican Republic', dial: '+1-809' },
  { iso: 'EC', name: 'Ecuador', dial: '+593' },
  { iso: 'EG', name: 'Egypt', dial: '+20' },
  { iso: 'SV', name: 'El Salvador', dial: '+503' },
  { iso: 'GQ', name: 'Equatorial Guinea', dial: '+240' },
  { iso: 'ER', name: 'Eritrea', dial: '+291' },
  { iso: 'EE', name: 'Estonia', dial: '+372' },
  { iso: 'SZ', name: 'Eswatini', dial: '+268' },
  { iso: 'ET', name: 'Ethiopia', dial: '+251' },
  { iso: 'FK', name: 'Falkland Islands', dial: '+500' },
  { iso: 'FO', name: 'Faroe Islands', dial: '+298' },
  { iso: 'FJ', name: 'Fiji', dial: '+679' },
  { iso: 'FI', name: 'Finland', dial: '+358' },
  { iso: 'FR', name: 'France', dial: '+33' },
  { iso: 'GF', name: 'French Guiana', dial: '+594' },
  { iso: 'PF', name: 'French Polynesia', dial: '+689' },
  { iso: 'GA', name: 'Gabon', dial: '+241' },
  { iso: 'GM', name: 'Gambia', dial: '+220' },
  { iso: 'GE', name: 'Georgia', dial: '+995' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'GH', name: 'Ghana', dial: '+233' },
  { iso: 'GI', name: 'Gibraltar', dial: '+350' },
  { iso: 'GR', name: 'Greece', dial: '+30' },
  { iso: 'GL', name: 'Greenland', dial: '+299' },
  { iso: 'GD', name: 'Grenada', dial: '+1-473' },
  { iso: 'GP', name: 'Guadeloupe', dial: '+590' },
  { iso: 'GU', name: 'Guam', dial: '+1-671' },
  { iso: 'GT', name: 'Guatemala', dial: '+502' },
  { iso: 'GN', name: 'Guinea', dial: '+224' },
  { iso: 'GW', name: 'Guinea-Bissau', dial: '+245' },
  { iso: 'GY', name: 'Guyana', dial: '+592' },
  { iso: 'HT', name: 'Haiti', dial: '+509' },
  { iso: 'HN', name: 'Honduras', dial: '+504' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852' },
  { iso: 'HU', name: 'Hungary', dial: '+36' },
  { iso: 'IS', name: 'Iceland', dial: '+354' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'ID', name: 'Indonesia', dial: '+62' },
  { iso: 'IR', name: 'Iran', dial: '+98' },
  { iso: 'IQ', name: 'Iraq', dial: '+964' },
  { iso: 'IE', name: 'Ireland', dial: '+353' },
  { iso: 'IL', name: 'Israel', dial: '+972' },
  { iso: 'IT', name: 'Italy', dial: '+39' },
  { iso: 'JM', name: 'Jamaica', dial: '+1-876' },
  { iso: 'JP', name: 'Japan', dial: '+81' },
  { iso: 'JO', name: 'Jordan', dial: '+962' },
  { iso: 'KZ', name: 'Kazakhstan', dial: '+7' },
  { iso: 'KE', name: 'Kenya', dial: '+254' },
  { iso: 'KI', name: 'Kiribati', dial: '+686' },
  { iso: 'XK', name: 'Kosovo', dial: '+383' },
  { iso: 'KW', name: 'Kuwait', dial: '+965' },
  { iso: 'KG', name: 'Kyrgyzstan', dial: '+996' },
  { iso: 'LA', name: 'Laos', dial: '+856' },
  { iso: 'LV', name: 'Latvia', dial: '+371' },
  { iso: 'LB', name: 'Lebanon', dial: '+961' },
  { iso: 'LS', name: 'Lesotho', dial: '+266' },
  { iso: 'LR', name: 'Liberia', dial: '+231' },
  { iso: 'LY', name: 'Libya', dial: '+218' },
  { iso: 'LI', name: 'Liechtenstein', dial: '+423' },
  { iso: 'LT', name: 'Lithuania', dial: '+370' },
  { iso: 'LU', name: 'Luxembourg', dial: '+352' },
  { iso: 'MO', name: 'Macao', dial: '+853' },
  { iso: 'MG', name: 'Madagascar', dial: '+261' },
  { iso: 'MW', name: 'Malawi', dial: '+265' },
  { iso: 'MY', name: 'Malaysia', dial: '+60' },
  { iso: 'MV', name: 'Maldives', dial: '+960' },
  { iso: 'ML', name: 'Mali', dial: '+223' },
  { iso: 'MT', name: 'Malta', dial: '+356' },
  { iso: 'MH', name: 'Marshall Islands', dial: '+692' },
  { iso: 'MQ', name: 'Martinique', dial: '+596' },
  { iso: 'MR', name: 'Mauritania', dial: '+222' },
  { iso: 'MU', name: 'Mauritius', dial: '+230' },
  { iso: 'YT', name: 'Mayotte', dial: '+262' },
  { iso: 'MX', name: 'Mexico', dial: '+52' },
  { iso: 'FM', name: 'Micronesia', dial: '+691' },
  { iso: 'MD', name: 'Moldova', dial: '+373' },
  { iso: 'MC', name: 'Monaco', dial: '+377' },
  { iso: 'MN', name: 'Mongolia', dial: '+976' },
  { iso: 'ME', name: 'Montenegro', dial: '+382' },
  { iso: 'MS', name: 'Montserrat', dial: '+1-664' },
  { iso: 'MA', name: 'Morocco', dial: '+212' },
  { iso: 'MZ', name: 'Mozambique', dial: '+258' },
  { iso: 'MM', name: 'Myanmar', dial: '+95' },
  { iso: 'NA', name: 'Namibia', dial: '+264' },
  { iso: 'NR', name: 'Nauru', dial: '+674' },
  { iso: 'NP', name: 'Nepal', dial: '+977' },
  { iso: 'NL', name: 'Netherlands', dial: '+31' },
  { iso: 'NC', name: 'New Caledonia', dial: '+687' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64' },
  { iso: 'NI', name: 'Nicaragua', dial: '+505' },
  { iso: 'NE', name: 'Niger', dial: '+227' },
  { iso: 'NG', name: 'Nigeria', dial: '+234' },
  { iso: 'NU', name: 'Niue', dial: '+683' },
  { iso: 'KP', name: 'North Korea', dial: '+850' },
  { iso: 'MK', name: 'North Macedonia', dial: '+389' },
  { iso: 'MP', name: 'Northern Mariana Islands', dial: '+1-670' },
  { iso: 'NO', name: 'Norway', dial: '+47' },
  { iso: 'OM', name: 'Oman', dial: '+968' },
  { iso: 'PK', name: 'Pakistan', dial: '+92' },
  { iso: 'PW', name: 'Palau', dial: '+680' },
  { iso: 'PS', name: 'Palestine', dial: '+970' },
  { iso: 'PA', name: 'Panama', dial: '+507' },
  { iso: 'PG', name: 'Papua New Guinea', dial: '+675' },
  { iso: 'PY', name: 'Paraguay', dial: '+595' },
  { iso: 'PE', name: 'Peru', dial: '+51' },
  { iso: 'PH', name: 'Philippines', dial: '+63' },
  { iso: 'PL', name: 'Poland', dial: '+48' },
  { iso: 'PT', name: 'Portugal', dial: '+351' },
  { iso: 'PR', name: 'Puerto Rico', dial: '+1-787' },
  { iso: 'QA', name: 'Qatar', dial: '+974' },
  { iso: 'RE', name: 'Réunion', dial: '+262' },
  { iso: 'RO', name: 'Romania', dial: '+40' },
  { iso: 'RU', name: 'Russia', dial: '+7' },
  { iso: 'RW', name: 'Rwanda', dial: '+250' },
  { iso: 'BL', name: 'Saint Barthélemy', dial: '+590' },
  { iso: 'SH', name: 'Saint Helena', dial: '+290' },
  { iso: 'KN', name: 'Saint Kitts and Nevis', dial: '+1-869' },
  { iso: 'LC', name: 'Saint Lucia', dial: '+1-758' },
  { iso: 'MF', name: 'Saint Martin', dial: '+590' },
  { iso: 'PM', name: 'Saint Pierre and Miquelon', dial: '+508' },
  { iso: 'VC', name: 'Saint Vincent and the Grenadines', dial: '+1-784' },
  { iso: 'WS', name: 'Samoa', dial: '+685' },
  { iso: 'SM', name: 'San Marino', dial: '+378' },
  { iso: 'ST', name: 'São Tomé and Príncipe', dial: '+239' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'SN', name: 'Senegal', dial: '+221' },
  { iso: 'RS', name: 'Serbia', dial: '+381' },
  { iso: 'SC', name: 'Seychelles', dial: '+248' },
  { iso: 'SL', name: 'Sierra Leone', dial: '+232' },
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'SX', name: 'Sint Maarten', dial: '+1-721' },
  { iso: 'SK', name: 'Slovakia', dial: '+421' },
  { iso: 'SI', name: 'Slovenia', dial: '+386' },
  { iso: 'SB', name: 'Solomon Islands', dial: '+677' },
  { iso: 'SO', name: 'Somalia', dial: '+252' },
  { iso: 'ZA', name: 'South Africa', dial: '+27' },
  { iso: 'KR', name: 'South Korea', dial: '+82' },
  { iso: 'SS', name: 'South Sudan', dial: '+211' },
  { iso: 'ES', name: 'Spain', dial: '+34' },
  { iso: 'LK', name: 'Sri Lanka', dial: '+94' },
  { iso: 'SD', name: 'Sudan', dial: '+249' },
  { iso: 'SR', name: 'Suriname', dial: '+597' },
  { iso: 'SE', name: 'Sweden', dial: '+46' },
  { iso: 'CH', name: 'Switzerland', dial: '+41' },
  { iso: 'SY', name: 'Syria', dial: '+963' },
  { iso: 'TW', name: 'Taiwan', dial: '+886' },
  { iso: 'TJ', name: 'Tajikistan', dial: '+992' },
  { iso: 'TZ', name: 'Tanzania', dial: '+255' },
  { iso: 'TH', name: 'Thailand', dial: '+66' },
  { iso: 'TL', name: 'Timor-Leste', dial: '+670' },
  { iso: 'TG', name: 'Togo', dial: '+228' },
  { iso: 'TO', name: 'Tonga', dial: '+676' },
  { iso: 'TT', name: 'Trinidad and Tobago', dial: '+1-868' },
  { iso: 'TN', name: 'Tunisia', dial: '+216' },
  { iso: 'TR', name: 'Turkey', dial: '+90' },
  { iso: 'TM', name: 'Turkmenistan', dial: '+993' },
  { iso: 'TC', name: 'Turks and Caicos Islands', dial: '+1-649' },
  { iso: 'TV', name: 'Tuvalu', dial: '+688' },
  { iso: 'UG', name: 'Uganda', dial: '+256' },
  { iso: 'UA', name: 'Ukraine', dial: '+380' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'UY', name: 'Uruguay', dial: '+598' },
  { iso: 'VI', name: 'US Virgin Islands', dial: '+1-340' },
  { iso: 'UZ', name: 'Uzbekistan', dial: '+998' },
  { iso: 'VU', name: 'Vanuatu', dial: '+678' },
  { iso: 'VA', name: 'Vatican City', dial: '+379' },
  { iso: 'VE', name: 'Venezuela', dial: '+58' },
  { iso: 'VN', name: 'Vietnam', dial: '+84' },
  { iso: 'WF', name: 'Wallis and Futuna', dial: '+681' },
  { iso: 'YE', name: 'Yemen', dial: '+967' },
  { iso: 'ZM', name: 'Zambia', dial: '+260' },
  { iso: 'ZW', name: 'Zimbabwe', dial: '+263' },
];

/* ─────────────────────────────────────────────
   Main Auth component
───────────────────────────────────────────── */
export default function Auth() {
  const router = useRouter();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<AuthFormState>({
    name: '', email: '', countryCode: '+1', phoneNumber: '',
    birthDate: '', profileImageUrl: '', password: '',
    confirmPassword: '', termsAccepted: false,
  });

  /* refs */
  const cardRef    = useRef<HTMLDivElement>(null);
  const leftRef    = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const fieldsRef  = useRef<HTMLDivElement>(null);
  const orb1       = useRef<HTMLDivElement>(null);
  const orb2       = useRef<HTMLDivElement>(null);
  const orb3       = useRef<HTMLDivElement>(null);
  const card1      = useRef<HTMLDivElement>(null);
  const card2      = useRef<HTMLDivElement>(null);

  const updateForm = (k: keyof AuthFormState, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  /* ── mount animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1.current, { y: -35, x: 18, duration: 7,   ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(orb2.current, { y: 25,  x: -22, duration: 9,  ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.8 });
      gsap.to(orb3.current, { y: -18, x: 28,  duration: 6,  ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.9 });
      gsap.to(card1.current, { y: -8, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(card2.current, { y: 6,  duration: 4.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.7 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(cardRef.current,    { y: 50, opacity: 0, duration: 0.9 })
        .from(leftRef.current,    { x: -40, opacity: 0, duration: 0.75 }, '-=0.55')
        .from(headingRef.current, { y: 22,  opacity: 0, duration: 0.55 }, '-=0.45')
        .from(subRef.current,     { y: 15,  opacity: 0, duration: 0.45 }, '-=0.35')
        .from('.a-field',         { y: 14, stagger: 0.08, duration: 0.45 }, '-=0.3')
        .from('.a-btn',           { y: 10, duration: 0.4 }, '-=0.15');
    });
    return () => ctx.revert();
  }, []);

  const animIn = (fromX = 0) =>
    gsap.fromTo('.a-field',
      { opacity: 0, y: 14, x: fromX },
      { opacity: 1, y: 0,  x: 0, stagger: 0.07, duration: 0.4, ease: 'power2.out' },
    );

  const shake = () => {
    if (!fieldsRef.current) return;

    gsap.timeline({ defaults: { ease: 'power2.out' } })
      .to(fieldsRef.current, { x: -7, duration: 0.06 })
      .to(fieldsRef.current, { x: 7, duration: 0.06 })
      .to(fieldsRef.current, { x: -5, duration: 0.06 })
      .to(fieldsRef.current, { x: 5, duration: 0.06 })
      .to(fieldsRef.current, { x: -3, duration: 0.06 })
      .to(fieldsRef.current, { x: 3, duration: 0.06 })
      .to(fieldsRef.current, { x: 0, duration: 0.09 });
  };

  const switchMode = () =>
    gsap.to(fieldsRef.current, {
      opacity: 0, y: -12, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setIsLogin(p => !p); setStep(1); setError(null); setSuccess(null);
        gsap.set(fieldsRef.current, { opacity: 1, y: 0 });
        setTimeout(() => animIn(), 30);
      },
    });

  const goNext = () =>
    gsap.to(fieldsRef.current, {
      opacity: 0, x: -22, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setStep(p => p + 1); setError(null);
        gsap.set(fieldsRef.current, { opacity: 1, x: 0 });
        setTimeout(() => animIn(22), 30);
      },
    });

  const goBack = () =>
    gsap.to(fieldsRef.current, {
      opacity: 0, x: 22, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setStep(p => p - 1); setError(null);
        gsap.set(fieldsRef.current, { opacity: 1, x: 0 });
        setTimeout(() => animIn(-22), 30);
      },
    });

  const buildPhone = () => {
    const cc  = form.countryCode.trim().replace(/\D/g, '');
    const num = form.phoneNumber.trim().replace(/\D/g, '');
    return cc && num ? `+${cc}${num}` : '';
  };

  const getAge = (d: string) => {
    const dob = new Date(d);
    if (Number.isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch('/api/uploads/image', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed');
    updateForm('profileImageUrl', data.url);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLogin && step < 3) {
      if (step === 1 && (!form.name || !form.email || !form.countryCode || !form.phoneNumber)) {
        setError('Please fill all required fields.'); shake(); return;
      }
      if (step === 2 && (!form.birthDate || getAge(form.birthDate) < 18)) {
        setError('You must be at least 18 years old.'); shake(); return;
      }
      goNext(); return;
    }

    if (!form.email || !form.password) {
      setError('Email and password are required.'); shake(); return;
    }

    if (!isLogin) {
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); shake(); return; }
      if (!form.termsAccepted) { setError('Please accept the terms to continue.'); return; }
    }

    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            phone: buildPhone(),
            birthDate: new Date(form.birthDate).toISOString(),
            profileImageUrl: form.profileImageUrl || undefined,
            password: form.password,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) { setError(data?.error || 'Authentication failed.'); shake(); return; }

      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
        document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      if (isLogin) {
        setSuccess('Welcome back!');
        setTimeout(() => router.push('/profile'), 500);
      } else {
        setSuccess('Account created! Now customize your profile card.');
        setTimeout(() => router.push('/profile'), 700);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabel    = ['Basic Info', 'Profile', 'Security'];
  const stepSubtitle = [
    'Tell us a little about yourself',
    'Add your birthday & a photo',
    'Secure your account',
  ];

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(root.classList.contains('dark'));

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen bg-transparent flex items-start lg:items-center justify-center p-4 pb-10 relative overflow-y-auto">

      <div className="fixed inset-0 z-0" aria-hidden style={{ pointerEvents: 'none' }}>
        <div className="absolute inset-0 opacity-68 dark:opacity-45" style={{ pointerEvents: 'none' }}>
          <Silk
            speed={3.4}
            scale={0.95}
            color={isDarkTheme ? '#7c3aed' : '#1e3a8a'}
            noiseIntensity={1.1}
            rotation={0.12}
          />
        </div>
        <div
          className="absolute inset-0 niche-animated-gradient bg-[linear-gradient(120deg,rgba(62,45,78,0.9),rgba(86,50,86,0.86),rgba(72,46,84,0.84),rgba(52,40,68,0.9))] dark:bg-[linear-gradient(120deg,rgba(8,8,12,0.95),rgba(34,8,28,0.85),rgba(16,8,26,0.86),rgba(6,6,10,0.95))]"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      <div className="absolute inset-0 opacity-35 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 15%, rgba(251,113,133,0.2), transparent 38%), radial-gradient(circle at 85% 75%, rgba(251,146,60,0.14), transparent 42%)' }} />

      {/* ambient orbs */}
      <div ref={orb1} className="absolute top-[-8%] left-[-6%] w-[520px] h-[520px] rounded-full bg-rose-500/20 blur-[130px] pointer-events-none" />
      <div ref={orb2} className="absolute bottom-[-12%] right-[-4%] w-[620px] h-[620px] rounded-full bg-orange-500/15 blur-[150px] pointer-events-none" />
      <div ref={orb3} className="absolute top-[38%] left-[48%] w-[420px] h-[420px] rounded-full bg-red-500/12 blur-[110px] pointer-events-none" />

      {/* card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.15fr,1fr] rounded-[32px] border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      >
        {/* ── LEFT PANEL ── */}
        <div
          ref={leftRef}
          className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#fb7185 0%,#fb923c 52%,#ef4444 100%)' }}
        >
          <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-black/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-xs font-semibold mb-8 border border-white/20">
              <Heart className="w-3 h-3 fill-white" />
              New connections await
            </div>
            <h1 className="text-6xl xl:text-7xl font-black text-white tracking-tight leading-none mb-5">
              Niche
            </h1>
            <p className="text-white/75 text-base leading-relaxed max-w-xs">
              Find people who get your world. Swipe on vibes, not just faces.
            </p>
          </div>

          {/* floating preview cards */}
          <div className="relative z-10 h-44 my-8">
            <div
              ref={card1}
              className="absolute left-0 top-0 w-36 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/25 shadow-xl"
              style={{ transform: 'rotate(-5deg)' }}
            >
              <div className="w-full h-20 rounded-xl bg-gradient-to-br from-white/30 to-white/10 mb-2.5" />
              <p className="text-white text-xs font-semibold">Alex, 24</p>
              <p className="text-white/55 text-[10px]">2 mi away</p>
            </div>
            <div
              ref={card2}
              className="absolute left-20 top-6 w-36 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/25 shadow-xl z-10"
              style={{ transform: 'rotate(4deg)' }}
            >
              <div className="w-full h-20 rounded-xl bg-gradient-to-br from-white/25 to-white/5 mb-2.5" />
              <p className="text-white text-xs font-semibold">Jordan, 27</p>
              <p className="text-white/55 text-[10px]">5 mi away</p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            {[{ label: 'Daily matches', value: '18k+' }, { label: 'Events nearby', value: '2,450' }].map(s => (
              <div key={s.label} className="rounded-2xl bg-black/20 backdrop-blur p-4 border border-white/10">
                <p className="text-white/60 text-xs mb-1">{s.label}</p>
                <p className="text-white text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="bg-[#111118] p-8 sm:p-10 flex flex-col justify-start lg:justify-center min-h-[620px]">

          {/* mobile wordmark */}
          <div className="lg:hidden mb-8">
            <span className="text-3xl font-black bg-gradient-to-r from-rose-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Niche
            </span>
          </div>

          {/* header */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              {!isLogin && step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : <div />}
              {!isLogin && (
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${
                      s === step ? 'w-6 bg-rose-500' : s < step ? 'w-4 bg-orange-400/75' : 'w-4 bg-white/10'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <h2 ref={headingRef} className="text-2xl sm:text-[28px] font-bold text-white mb-1.5 leading-tight">
              {isLogin ? 'Welcome back' : stepLabel[step - 1]}
            </h2>
            <p ref={subRef} className="text-white/40 text-sm">
              {isLogin ? 'Sign in to keep swiping' : stepSubtitle[step - 1]}
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit}>
            <div ref={fieldsRef} className="space-y-3.5">

              {/* LOGIN */}
              {isLogin && (
                <>
                  <div className="a-field">
                    <InputField label="Email" type="email" value={form.email}
                      onChange={v => updateForm('email', v)} icon={Mail}
                      placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="a-field">
                    <InputField
                      label="Password" type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={v => updateForm('password', v)}
                      icon={Lock} placeholder="••••••••" autoComplete="current-password"
                      suffix={
                        <button type="button" onClick={() => setShowPassword(p => !p)}
                          className="text-white/30 hover:text-white/60 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                  <div className="a-field flex justify-between pt-1">
                    <button type="button" onClick={() => router.push('/auth/forgot-password')}
                      className="text-rose-400 hover:text-rose-300 text-xs transition-colors">
                      Forgot password?
                    </button>
                    <button type="button" onClick={() => router.push('/auth/verify')}
                      className="text-white/30 hover:text-white/55 text-xs transition-colors">
                      Verify email
                    </button>
                  </div>
                </>
              )}

              {/* REGISTER STEP 1 */}
              {!isLogin && step === 1 && (
                <>
                  <div className="a-field">
                    <InputField label="Full name" type="text" value={form.name}
                      onChange={v => updateForm('name', v)} icon={User} placeholder="Your name" />
                  </div>
                  <div className="a-field">
                    <InputField label="Email" type="email" value={form.email}
                      onChange={v => updateForm('email', v)} icon={Mail} placeholder="you@example.com" />
                  </div>
                  <div className="a-field flex gap-2">
                    <div className="w-[170px] flex-shrink-0">
                      <label className="text-[11px] text-white/40 font-medium pl-1 block mb-1.5">Country code</label>
                      <div className="flex items-center gap-2 px-3 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] focus-within:border-rose-400/55 transition-colors">
                        <Phone className="w-4 h-4 text-white/30" />
                        <select
                          value={form.countryCode}
                          onChange={(e) => updateForm('countryCode', e.target.value)}
                          className="w-full bg-transparent text-white text-sm outline-none"
                        >
                          {COUNTRY_DIAL_CODES.map((c) => (
                            <option key={`${c.iso}-${c.dial}`} value={c.dial} className="bg-[#111118] text-white">
                              {c.name} ({c.dial})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <InputField label="Phone" type="tel" value={form.phoneNumber}
                        onChange={v => updateForm('phoneNumber', v)} icon={Phone} placeholder="5550000000" />
                    </div>
                  </div>
                </>
              )}

              {/* REGISTER STEP 2 */}
              {!isLogin && step === 2 && (
                <>
                  <div className="a-field space-y-1.5">
                    <label className="text-[11px] text-white/40 font-medium pl-1 block">Birthday</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={e => updateForm('birthDate', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white text-sm outline-none focus:border-rose-400/55 focus:bg-white/[0.08] transition-all [color-scheme:dark]"
                    />
                    <p className="text-[11px] text-white/25 pl-1">Must be 18 or older</p>
                  </div>
                  <div className="a-field">
                    <label className="text-[11px] text-white/40 font-medium pl-1 block mb-1.5">
                      Profile photo <span className="text-white/20">(optional)</span>
                    </label>
                    <label className="flex flex-col items-center justify-center gap-2.5 w-full py-8 rounded-2xl border border-dashed border-white/12 hover:border-rose-400/45 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all group">
                      {form.profileImageUrl ? (
                        <>
                          <div className="w-11 h-11 rounded-full bg-rose-400/20 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-rose-300" />
                          </div>
                          <p className="text-rose-300 text-xs font-medium">Photo uploaded ✓</p>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-full bg-white/8 flex items-center justify-center group-hover:bg-white/12 transition-colors">
                            <Upload className="w-5 h-5 text-white/35" />
                          </div>
                          <p className="text-white/40 text-xs">Drop or click to upload</p>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async e => {
                          try { await uploadImage(e.target.files?.[0]); }
                          catch (err) { setError(err instanceof Error ? err.message : 'Upload failed'); }
                        }}
                      />
                    </label>
                  </div>
                </>
              )}

              {/* REGISTER STEP 3 */}
              {!isLogin && step === 3 && (
                <>
                  <div className="a-field">
                    <InputField
                      label="Password" type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={v => updateForm('password', v)}
                      icon={Lock} placeholder="At least 8 characters"
                      suffix={
                        <button type="button" onClick={() => setShowPassword(p => !p)}
                          className="text-white/30 hover:text-white/60 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                  <div className="a-field">
                    <InputField
                      label="Confirm password" type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword} onChange={v => updateForm('confirmPassword', v)}
                      icon={Lock} placeholder="Repeat password"
                      suffix={
                        <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                          className="text-white/30 hover:text-white/60 transition-colors">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                  <div className="a-field flex items-start gap-3 pt-1">
                    <div
                      onClick={() => updateForm('termsAccepted', !form.termsAccepted)}
                      className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 cursor-pointer border transition-all flex items-center justify-center ${
                        form.termsAccepted ? 'bg-rose-500 border-rose-500' : 'border-white/25 hover:border-rose-400/50'
                      }`}
                    >
                      {form.termsAccepted && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-full h-full text-white p-0.5">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] text-white/35 leading-relaxed">
                      I agree to the{' '}
                      <span className="text-rose-400 hover:underline cursor-pointer">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-rose-400 hover:underline cursor-pointer">Privacy Policy</span>
                    </span>
                  </div>
                </>
              )}

              {/* feedback */}
              {error && (
                <div className="a-field px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-red-400 text-xs">{error}</span>
                </div>
              )}
              {success && (
                <div className="a-field px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-400 text-xs">{success}</span>
                </div>
              )}

              {/* CTA */}
              <div className="a-field pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="a-btn w-full py-[15px] rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg,#fb7185 0%,#fb923c 55%,#ef4444 100%)',
                    boxShadow: '0 10px 36px rgba(251,113,133,0.35)',
                  }}
                  onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.018, y: -1, duration: 0.2 })}
                  onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, y: 0, duration: 0.2 })}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Please wait…
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign in' : step === 3 ? 'Create account' : 'Continue'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* toggle */}
          <p className="mt-6 text-center text-sm text-white/35">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
