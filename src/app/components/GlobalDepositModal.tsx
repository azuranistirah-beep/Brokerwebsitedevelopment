import { useState, useEffect } from "react";
import { X, Wallet, CreditCard, Smartphone, QrCode, Bitcoin, Globe, ChevronDown, Search, Building2, Zap, Check } from "lucide-react";
import { Button } from "./ui/button";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface GlobalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onDepositSuccess?: () => void;
}

type PaymentMethod = 'bank' | 'ewallet' | 'qris' | 'fpx' | 'paynow' | 'promptpay' | 'pix' | 'spei' | 'upi' | 'alipay' | 'wechat' | 'crypto' | 'card' | 'paypal' | 'stripe' | 'skrill' | 'neteller' | 'paysafe' | 'interac' | 'ideal' | 'sofort' | 'giropay' | 'eps' | 'multibanco' | 'bancontact' | 'p24' | 'blik' | 'sepa' | 'mpesa' | 'airtel' | 'mtn' | 'orange' | 'ach' | 'wire';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  currency: string;
  symbol: string;
  banks: Array<{ code: string; name: string; color: string }>;
  ewallets: Array<{ code: string; name: string; color: string }>;
  specialMethods?: Array<{ code: string; name: string; type: PaymentMethod; icon: string; color: string }>;
}

// Comprehensive list of ALL countries with their payment methods
const COUNTRIES: Record<string, Country> = {
  // ASIA-PACIFIC
  MY: {
    code: 'MY',
    name: 'Malaysia',
    region: 'Asia-Pacific',
    flag: '🇲🇾',
    currency: 'MYR',
    symbol: 'RM',
    banks: [
      { code: 'MAYBANK', name: 'Maybank', color: 'bg-yellow-600' },
      { code: 'CIMB', name: 'CIMB Bank', color: 'bg-red-600' },
      { code: 'PUBLIC_BANK', name: 'Public Bank', color: 'bg-blue-600' },
      { code: 'RHB', name: 'RHB Bank', color: 'bg-blue-700' },
      { code: 'HONG_LEONG', name: 'Hong Leong Bank', color: 'bg-green-600' },
      { code: 'AMBANK', name: 'AmBank', color: 'bg-orange-600' },
      { code: 'BANK_ISLAM', name: 'Bank Islam', color: 'bg-teal-600' },
      { code: 'AFFIN', name: 'Affin Bank', color: 'bg-blue-800' },
      { code: 'ALLIANCE', name: 'Alliance Bank', color: 'bg-purple-600' },
      { code: 'BSN', name: 'Bank Simpanan Nasional', color: 'bg-yellow-700' },
    ],
    ewallets: [
      { code: 'TNG', name: "Touch 'n Go", color: 'bg-blue-500' },
      { code: 'GRABPAY', name: 'GrabPay', color: 'bg-green-600' },
      { code: 'BOOST', name: 'Boost', color: 'bg-orange-500' },
      { code: 'SHOPEEPAY', name: 'ShopeePay', color: 'bg-orange-600' },
    ],
    specialMethods: [
      { code: 'FPX', name: 'FPX', type: 'fpx', icon: '⚡', color: 'bg-blue-600' },
    ],
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    region: 'Asia-Pacific',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: 'S$',
    banks: [
      { code: 'DBS', name: 'DBS Bank', color: 'bg-red-600' },
      { code: 'OCBC', name: 'OCBC Bank', color: 'bg-red-700' },
      { code: 'UOB', name: 'UOB Bank', color: 'bg-blue-700' },
      { code: 'POSB', name: 'POSB', color: 'bg-red-500' },
      { code: 'HSBC', name: 'HSBC Singapore', color: 'bg-red-600' },
      { code: 'MAYBANK', name: 'Maybank Singapore', color: 'bg-yellow-600' },
      { code: 'CIMB', name: 'CIMB Bank', color: 'bg-red-700' },
      { code: 'SCB', name: 'Standard Chartered', color: 'bg-blue-800' },
    ],
    ewallets: [
      { code: 'GRABPAY', name: 'GrabPay', color: 'bg-green-600' },
      { code: 'SHOPEE', name: 'ShopeePay', color: 'bg-orange-500' },
    ],
    specialMethods: [
      { code: 'PAYNOW', name: 'PayNow', type: 'paynow', icon: '⚡', color: 'bg-blue-600' },
    ],
  },
  TH: {
    code: 'TH',
    name: 'Thailand',
    region: 'Asia-Pacific',
    flag: '🇹🇭',
    currency: 'THB',
    symbol: '฿',
    banks: [
      { code: 'BANGKOK_BANK', name: 'Bangkok Bank', color: 'bg-blue-700' },
      { code: 'KASIKORN', name: 'Kasikornbank', color: 'bg-green-600' },
      { code: 'SCB', name: 'Siam Commercial Bank', color: 'bg-purple-600' },
      { code: 'KRUNGSRI', name: 'Krungsri Bank', color: 'bg-yellow-600' },
      { code: 'TMB', name: 'TMBThanachart Bank', color: 'bg-orange-600' },
      { code: 'KRUNGTHAI', name: 'Krungthai Bank', color: 'bg-blue-600' },
      { code: 'GSB', name: 'Government Savings Bank', color: 'bg-pink-600' },
      { code: 'BAY', name: 'Bank of Ayudhya', color: 'bg-yellow-700' },
    ],
    ewallets: [
      { code: 'TRUEMONEY', name: 'TrueMoney Wallet', color: 'bg-orange-500' },
      { code: 'RABBIT_LINE_PAY', name: 'Rabbit LINE Pay', color: 'bg-green-500' },
      { code: 'SHOPEEPAY', name: 'ShopeePay', color: 'bg-orange-600' },
    ],
    specialMethods: [
      { code: 'PROMPTPAY', name: 'PromptPay', type: 'promptpay', icon: '📱', color: 'bg-blue-600' },
    ],
  },
  PH: {
    code: 'PH',
    name: 'Philippines',
    region: 'Asia-Pacific',
    flag: '🇵🇭',
    currency: 'PHP',
    symbol: '₱',
    banks: [
      { code: 'BDO', name: 'BDO Unibank', color: 'bg-blue-700' },
      { code: 'BPI', name: 'Bank of the Philippine Islands', color: 'bg-red-600' },
      { code: 'METROBANK', name: 'Metrobank', color: 'bg-orange-600' },
      { code: 'RCBC', name: 'RCBC', color: 'bg-green-600' },
      { code: 'UNIONBANK', name: 'UnionBank', color: 'bg-blue-600' },
      { code: 'PNB', name: 'Philippine National Bank', color: 'bg-yellow-600' },
      { code: 'SECURITY_BANK', name: 'Security Bank', color: 'bg-orange-700' },
      { code: 'CHINABANK', name: 'China Bank', color: 'bg-red-700' },
      { code: 'LANDBANK', name: 'Land Bank', color: 'bg-green-700' },
    ],
    ewallets: [
      { code: 'GCASH', name: 'GCash', color: 'bg-blue-500' },
      { code: 'PAYMAYA', name: 'Maya', color: 'bg-green-600' },
      { code: 'GRABPAY', name: 'GrabPay', color: 'bg-green-700' },
      { code: 'SHOPEEPAY', name: 'ShopeePay', color: 'bg-orange-500' },
    ],
    specialMethods: [],
  },
  VN: {
    code: 'VN',
    name: 'Vietnam',
    region: 'Asia-Pacific',
    flag: '🇻🇳',
    currency: 'VND',
    symbol: '₫',
    banks: [
      { code: 'VIETCOMBANK', name: 'Vietcombank', color: 'bg-green-600' },
      { code: 'TECHCOMBANK', name: 'Techcombank', color: 'bg-blue-600' },
      { code: 'BIDV', name: 'BIDV', color: 'bg-blue-700' },
      { code: 'VIETINBANK', name: 'VietinBank', color: 'bg-orange-600' },
      { code: 'ACB', name: 'ACB', color: 'bg-green-700' },
      { code: 'MB', name: 'MB Bank', color: 'bg-blue-800' },
      { code: 'VPB', name: 'VPBank', color: 'bg-green-800' },
      { code: 'SACOMBANK', name: 'Sacombank', color: 'bg-blue-600' },
    ],
    ewallets: [
      { code: 'MOMO', name: 'MoMo', color: 'bg-pink-600' },
      { code: 'ZALOPAY', name: 'ZaloPay', color: 'bg-blue-500' },
      { code: 'VNPAY', name: 'VNPay', color: 'bg-red-600' },
    ],
    specialMethods: [],
  },
  IN: {
    code: 'IN',
    name: 'India',
    region: 'Asia-Pacific',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    banks: [
      { code: 'SBI', name: 'State Bank of India', color: 'bg-blue-600' },
      { code: 'HDFC', name: 'HDFC Bank', color: 'bg-blue-700' },
      { code: 'ICICI', name: 'ICICI Bank', color: 'bg-orange-600' },
      { code: 'AXIS', name: 'Axis Bank', color: 'bg-red-600' },
      { code: 'KOTAK', name: 'Kotak Mahindra', color: 'bg-red-700' },
      { code: 'PNB', name: 'Punjab National Bank', color: 'bg-blue-800' },
      { code: 'BOB', name: 'Bank of Baroda', color: 'bg-orange-700' },
      { code: 'CANARA', name: 'Canara Bank', color: 'bg-yellow-600' },
      { code: 'IDBI', name: 'IDBI Bank', color: 'bg-green-700' },
    ],
    ewallets: [
      { code: 'PAYTM', name: 'Paytm', color: 'bg-blue-600' },
      { code: 'PHONEPE', name: 'PhonePe', color: 'bg-purple-600' },
      { code: 'GOOGLEPAY', name: 'Google Pay', color: 'bg-blue-500' },
    ],
    specialMethods: [
      { code: 'UPI', name: 'UPI', type: 'upi', icon: '🇮🇳', color: 'bg-orange-600' },
    ],
  },
  CN: {
    code: 'CN',
    name: 'China',
    region: 'Asia-Pacific',
    flag: '🇨🇳',
    currency: 'CNY',
    symbol: '¥',
    banks: [
      { code: 'ICBC', name: 'ICBC', color: 'bg-red-600' },
      { code: 'CCB', name: 'China Construction Bank', color: 'bg-blue-600' },
      { code: 'ABC', name: 'Agricultural Bank of China', color: 'bg-green-600' },
      { code: 'BOC', name: 'Bank of China', color: 'bg-red-700' },
      { code: 'BCM', name: 'Bank of Communications', color: 'bg-blue-700' },
    ],
    ewallets: [],
    specialMethods: [
      { code: 'ALIPAY', name: 'Alipay', type: 'alipay', icon: '🔵', color: 'bg-blue-500' },
      { code: 'WECHAT', name: 'WeChat Pay', type: 'wechat', icon: '🟢', color: 'bg-green-600' },
    ],
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    region: 'Asia-Pacific',
    flag: '🇯🇵',
    currency: 'JPY',
    symbol: '¥',
    banks: [
      { code: 'MUFG', name: 'MUFG Bank', color: 'bg-red-600' },
      { code: 'SMBC', name: 'Sumitomo Mitsui', color: 'bg-green-600' },
      { code: 'MIZUHO', name: 'Mizuho Bank', color: 'bg-blue-600' },
      { code: 'RESONA', name: 'Resona Bank', color: 'bg-orange-600' },
    ],
    ewallets: [
      { code: 'PAYPAY', name: 'PayPay', color: 'bg-red-500' },
      { code: 'LINE_PAY', name: 'LINE Pay', color: 'bg-green-500' },
      { code: 'RAKUTEN', name: 'Rakuten Pay', color: 'bg-red-600' },
    ],
    specialMethods: [],
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    region: 'Asia-Pacific',
    flag: '🇰🇷',
    currency: 'KRW',
    symbol: '₩',
    banks: [
      { code: 'KB', name: 'KB Kookmin Bank', color: 'bg-yellow-600' },
      { code: 'SHINHAN', name: 'Shinhan Bank', color: 'bg-blue-600' },
      { code: 'WOORI', name: 'Woori Bank', color: 'bg-blue-700' },
      { code: 'HANA', name: 'Hana Bank', color: 'bg-green-600' },
    ],
    ewallets: [
      { code: 'KAKAO_PAY', name: 'Kakao Pay', color: 'bg-yellow-500' },
      { code: 'NAVER_PAY', name: 'Naver Pay', color: 'bg-green-600' },
      { code: 'TOSS', name: 'Toss', color: 'bg-blue-500' },
    ],
    specialMethods: [],
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    region: 'Asia-Pacific',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    banks: [
      { code: 'CBA', name: 'Commonwealth Bank', color: 'bg-yellow-600' },
      { code: 'WESTPAC', name: 'Westpac', color: 'bg-red-600' },
      { code: 'ANZ', name: 'ANZ', color: 'bg-blue-600' },
      { code: 'NAB', name: 'NAB', color: 'bg-red-700' },
      { code: 'MACQUARIE', name: 'Macquarie Bank', color: 'bg-green-600' },
    ],
    ewallets: [],
    specialMethods: [],
  },
  NZ: {
    code: 'NZ',
    name: 'New Zealand',
    region: 'Asia-Pacific',
    flag: '🇳🇿',
    currency: 'NZD',
    symbol: 'NZ$',
    banks: [
      { code: 'ANZ_NZ', name: 'ANZ', color: 'bg-blue-600' },
      { code: 'ASB', name: 'ASB Bank', color: 'bg-yellow-600' },
      { code: 'WESTPAC_NZ', name: 'Westpac', color: 'bg-red-600' },
      { code: 'BNZ', name: 'BNZ', color: 'bg-orange-600' },
    ],
    ewallets: [],
    specialMethods: [],
  },

  // NORTH AMERICA
  US: {
    code: 'US',
    name: 'United States',
    region: 'North America',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    banks: [
      { code: 'CHASE', name: 'Chase', color: 'bg-blue-700' },
      { code: 'BOA', name: 'Bank of America', color: 'bg-red-600' },
      { code: 'WELLS_FARGO', name: 'Wells Fargo', color: 'bg-yellow-700' },
      { code: 'CITI', name: 'Citibank', color: 'bg-blue-600' },
      { code: 'US_BANK', name: 'U.S. Bank', color: 'bg-red-700' },
      { code: 'PNC', name: 'PNC Bank', color: 'bg-orange-600' },
      { code: 'TRUIST', name: 'Truist Bank', color: 'bg-purple-600' },
      { code: 'TD_BANK', name: 'TD Bank', color: 'bg-green-600' },
      { code: 'CAPITAL_ONE', name: 'Capital One', color: 'bg-red-500' },
      { code: 'SCHWAB', name: 'Charles Schwab', color: 'bg-blue-800' },
    ],
    ewallets: [
      { code: 'VENMO', name: 'Venmo', color: 'bg-blue-500' },
      { code: 'CASHAPP', name: 'Cash App', color: 'bg-green-600' },
      { code: 'ZELLE', name: 'Zelle', color: 'bg-purple-600' },
      { code: 'APPLE_PAY', name: 'Apple Pay', color: 'bg-slate-800' },
    ],
    specialMethods: [
      { code: 'ACH', name: 'ACH Transfer', type: 'ach', icon: '🏦', color: 'bg-blue-600' },
      { code: 'WIRE', name: 'Wire Transfer', type: 'wire', icon: '⚡', color: 'bg-purple-600' },
    ],
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    region: 'North America',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'C$',
    banks: [
      { code: 'RBC', name: 'RBC Royal Bank', color: 'bg-blue-700' },
      { code: 'TD', name: 'TD Bank', color: 'bg-green-600' },
      { code: 'SCOTIA', name: 'Scotiabank', color: 'bg-red-600' },
      { code: 'BMO', name: 'BMO', color: 'bg-blue-600' },
      { code: 'CIBC', name: 'CIBC', color: 'bg-red-700' },
      { code: 'NATIONAL', name: 'National Bank', color: 'bg-red-800' },
    ],
    ewallets: [],
    specialMethods: [
      { code: 'INTERAC', name: 'Interac e-Transfer', type: 'interac', icon: '🇨🇦', color: 'bg-yellow-600' },
    ],
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    region: 'North America',
    flag: '🇲🇽',
    currency: 'MXN',
    symbol: 'MX$',
    banks: [
      { code: 'BBVA', name: 'BBVA México', color: 'bg-blue-600' },
      { code: 'SANTANDER', name: 'Santander', color: 'bg-red-600' },
      { code: 'BANORTE', name: 'Banorte', color: 'bg-red-700' },
      { code: 'HSBC_MX', name: 'HSBC México', color: 'bg-red-600' },
      { code: 'BANAMEX', name: 'Citibanamex', color: 'bg-blue-700' },
    ],
    ewallets: [],
    specialMethods: [
      { code: 'SPEI', name: 'SPEI', type: 'spei', icon: '🇲🇽', color: 'bg-green-600' },
    ],
  },

  // SOUTH AMERICA
  BR: {
    code: 'BR',
    name: 'Brazil',
    region: 'South America',
    flag: '🇧🇷',
    currency: 'BRL',
    symbol: 'R$',
    banks: [
      { code: 'ITAU', name: 'Itaú', color: 'bg-orange-600' },
      { code: 'BRADESCO', name: 'Bradesco', color: 'bg-red-600' },
      { code: 'SANTANDER_BR', name: 'Santander', color: 'bg-red-700' },
      { code: 'BB', name: 'Banco do Brasil', color: 'bg-yellow-600' },
      { code: 'CAIXA', name: 'Caixa Econômica', color: 'bg-blue-600' },
    ],
    ewallets: [
      { code: 'MERCADO_PAGO', name: 'Mercado Pago', color: 'bg-blue-500' },
      { code: 'PICPAY', name: 'PicPay', color: 'bg-green-600' },
    ],
    specialMethods: [
      { code: 'PIX', name: 'PIX', type: 'pix', icon: '🇧🇷', color: 'bg-green-600' },
    ],
  },
  AR: {
    code: 'AR',
    name: 'Argentina',
    region: 'South America',
    flag: '🇦🇷',
    currency: 'ARS',
    symbol: '$',
    banks: [
      { code: 'GALICIA', name: 'Banco Galicia', color: 'bg-orange-600' },
      { code: 'SANTANDER_AR', name: 'Santander', color: 'bg-red-600' },
      { code: 'BBVA_AR', name: 'BBVA Argentina', color: 'bg-blue-600' },
      { code: 'NACION', name: 'Banco Nación', color: 'bg-blue-700' },
    ],
    ewallets: [
      { code: 'MERCADO_PAGO_AR', name: 'Mercado Pago', color: 'bg-blue-500' },
    ],
    specialMethods: [],
  },

  // EUROPE
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    banks: [
      { code: 'HSBC', name: 'HSBC', color: 'bg-red-600' },
      { code: 'BARCLAYS', name: 'Barclays', color: 'bg-blue-600' },
      { code: 'LLOYDS', name: 'Lloyds', color: 'bg-green-600' },
      { code: 'NATWEST', name: 'NatWest', color: 'bg-purple-600' },
      { code: 'SANTANDER_UK', name: 'Santander UK', color: 'bg-red-700' },
      { code: 'HALIFAX', name: 'Halifax', color: 'bg-blue-700' },
      { code: 'TSB', name: 'TSB Bank', color: 'bg-blue-800' },
    ],
    ewallets: [],
    specialMethods: [],
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    region: 'Europe',
    flag: '🇩🇪',
    currency: 'EUR',
    symbol: '€',
    banks: [
      { code: 'DEUTSCHE_BANK', name: 'Deutsche Bank', color: 'bg-blue-700' },
      { code: 'COMMERZBANK', name: 'Commerzbank', color: 'bg-yellow-600' },
      { code: 'DKB', name: 'DKB', color: 'bg-blue-600' },
      { code: 'ING', name: 'ING', color: 'bg-orange-600' },
      { code: 'POSTBANK', name: 'Postbank', color: 'bg-yellow-700' },
    ],
    ewallets: [],
    specialMethods: [
      { code: 'SOFORT', name: 'Sofort', type: 'sofort', icon: '🇩🇪', color: 'bg-pink-600' },
      { code: 'GIROPAY', name: 'Giropay', type: 'giropay', icon: '🇩🇪', color: 'bg-blue-600' },
    ],
  },
  FR: {
    code: 'FR',
    name: 'France',
    region: 'Europe',
    flag: '🇫🇷',
    currency: 'EUR',
    symbol: '€',
    banks: [
      { code: 'BNP', name: 'BNP Paribas', color: 'bg-green-600' },
      { code: 'CREDIT_AGRICOLE', name: 'Crédit Agricole', color: 'bg-green-700' },
      { code: 'SOCIETE_GENERALE', name: 'Société Générale', color: 'bg-red-600' },
      { code: 'LCL', name: 'LCL', color: 'bg-blue-600' },
    ],
    ewallets: [],
    specialMethods: [],
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    region: 'Europe',
    flag: '🇳🇱',
    currency: 'EUR',
    symbol: '€',
    banks: [
      { code: 'ING', name: 'ING', color: 'bg-orange-600' },
      { code: 'ABN_AMRO', name: 'ABN AMRO', color: 'bg-green-600' },
      { code: 'RABOBANK', name: 'Rabobank', color: 'bg-blue-600' },
      { code: 'SNS', name: 'SNS Bank', color: 'bg-purple-600' },
    ],
    ewallets: [],
    specialMethods: [
      { code: 'IDEAL', name: 'iDEAL', type: 'ideal', icon: '🇳🇱', color: 'bg-pink-600' },
    ],
  },

  // MIDDLE EAST
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    region: 'Middle East',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'د.إ',
    banks: [
      { code: 'EMIRATES_NBD', name: 'Emirates NBD', color: 'bg-red-600' },
      { code: 'ADCB', name: 'ADCB', color: 'bg-blue-600' },
      { code: 'MASHREQ', name: 'Mashreq Bank', color: 'bg-orange-600' },
      { code: 'FAB', name: 'First Abu Dhabi Bank', color: 'bg-blue-700' },
      { code: 'DIB', name: 'Dubai Islamic Bank', color: 'bg-green-600' },
    ],
    ewallets: [],
    specialMethods: [],
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    region: 'Middle East',
    flag: '🇸🇦',
    currency: 'SAR',
    symbol: 'ر.س',
    banks: [
      { code: 'NCB', name: 'NCB', color: 'bg-green-600' },
      { code: 'RAJHI', name: 'Al Rajhi Bank', color: 'bg-blue-600' },
      { code: 'SAMBA', name: 'Samba Financial Group', color: 'bg-red-600' },
      { code: 'RIYAD', name: 'Riyad Bank', color: 'bg-blue-700' },
    ],
    ewallets: [
      { code: 'STC_PAY', name: 'STC Pay', color: 'bg-purple-600' },
    ],
    specialMethods: [],
  },

  // AFRICA
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    region: 'Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    symbol: 'R',
    banks: [
      { code: 'FNB', name: 'FNB', color: 'bg-blue-600' },
      { code: 'STANDARD_BANK', name: 'Standard Bank', color: 'bg-blue-700' },
      { code: 'ABSA', name: 'Absa', color: 'bg-red-600' },
      { code: 'NEDBANK', name: 'Nedbank', color: 'bg-green-600' },
      { code: 'CAPITEC', name: 'Capitec Bank', color: 'bg-blue-500' },
    ],
    ewallets: [],
    specialMethods: [],
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    region: 'Africa',
    flag: '🇳🇬',
    currency: 'NGN',
    symbol: '₦',
    banks: [
      { code: 'GTB', name: 'GTBank', color: 'bg-orange-600' },
      { code: 'ZENITH', name: 'Zenith Bank', color: 'bg-red-600' },
      { code: 'UBA', name: 'UBA', color: 'bg-red-700' },
      { code: 'ACCESS', name: 'Access Bank', color: 'bg-orange-700' },
      { code: 'FIRST', name: 'First Bank', color: 'bg-blue-600' },
    ],
    ewallets: [],
    specialMethods: [],
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    region: 'Africa',
    flag: '🇰🇪',
    currency: 'KES',
    symbol: 'KSh',
    banks: [
      { code: 'KCB', name: 'KCB Bank', color: 'bg-blue-600' },
      { code: 'EQUITY', name: 'Equity Bank', color: 'bg-red-600' },
      { code: 'COOP', name: 'Co-operative Bank', color: 'bg-green-600' },
    ],
    ewallets: [],
    specialMethods: [
      { code: 'MPESA', name: 'M-Pesa', type: 'mpesa', icon: '🇰🇪', color: 'bg-green-600' },
    ],
  },
};

const CRYPTOS = [
  { code: 'USDT', name: 'Tether (USDT)', network: 'TRC20', color: 'bg-emerald-600', symbol: 'USDT' },
  { code: 'BTC', name: 'Bitcoin', network: 'Bitcoin', color: 'bg-orange-500', symbol: 'BTC' },
  { code: 'ETH', name: 'Ethereum', network: 'ERC20', color: 'bg-blue-500', symbol: 'ETH' },
  { code: 'BNB', name: 'Binance Coin', network: 'BEP20', color: 'bg-yellow-500', symbol: 'BNB' },
];

// Minimum deposit amounts per country (in local currency)
const MIN_DEPOSIT_AMOUNTS: Record<string, number> = {
  US: 200,   // United States: $200
  MY: 500,   // Malaysia: RM500
  SG: 200,   // Singapore: S$200
  TH: 2000,  // Thailand: ฿2,000
  PH: 2500,  // Philippines: ₱2,500
  VN: 1000000, // Vietnam: ₫1,000,000
  IN: 5000,  // India: ₹5,000
  CN: 500,   // China: ¥500
  JP: 10000, // Japan: ¥10,000
  KR: 100000, // South Korea: ₩100,000
  AU: 200,   // Australia: A$200
  NZ: 200,   // New Zealand: NZ$200
  CA: 200,   // Canada: C$200
  MX: 1000,  // Mexico: MX$1,000
  BR: 500,   // Brazil: R$500
  AR: 50000, // Argentina: $50,000
  GB: 150,   // UK: £150
  EU: 150,   // Eurozone: €150
  AE: 500,   // UAE: د.إ500
  SA: 500,   // Saudi Arabia: ر.س500
  ZA: 1000,  // South Africa: R1,000
  NG: 50000, // Nigeria: ₦50,000
  KE: 10000, // Kenya: KSh10,000
};

// Exchange rates (would be fetched from live API in production)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, CNY: 7.24, INR: 83.12, AUD: 1.52, CAD: 1.36,
  CHF: 0.88, HKD: 7.83, SGD: 1.34, SEK: 10.48, KRW: 1326, NOK: 10.63, NZD: 1.63, MXN: 17.12,
  ZAR: 18.62, BRL: 4.98, RUB: 92.5, TRY: 32.5, PLN: 3.98, THB: 34.5, MYR: 4.45,
  PHP: 56.2, VND: 24500, SAR: 3.75, AED: 3.67, ILS: 3.65, CLP: 920, ARS: 850,
  COP: 3950, PEN: 3.72, EGP: 30.9, NGN: 1560, KES: 129, DKK: 6.86, CZK: 22.5,
  HUF: 354, RON: 4.57, BGN: 1.80, HRK: 6.94, ISK: 137, UAH: 36.9, PKR: 278,
};

export function GlobalDepositModal({ isOpen, onClose, userEmail, onDepositSuccess }: GlobalDepositModalProps) {
  const [step, setStep] = useState<'method' | 'amount' | 'payment'>('method');
  const [detectedCountry, setDetectedCountry] = useState<string>('US');
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedEwallet, setSelectedEwallet] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedSpecialMethod, setSelectedSpecialMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const country = COUNTRIES[selectedCountry] || COUNTRIES.US;
  const exchangeRate = EXCHANGE_RATES[country.currency] || 1;
  
  // Get minimum deposit for this country (in local currency)
  const getMinDepositForCountry = (countryCode: string) => {
    if (MIN_DEPOSIT_AMOUNTS[countryCode]) return MIN_DEPOSIT_AMOUNTS[countryCode];
    const curr = COUNTRIES[countryCode]?.currency;
    if (curr === 'EUR') return MIN_DEPOSIT_AMOUNTS.EU || Math.ceil(150 * exchangeRate);
    return Math.ceil(50 * exchangeRate);
  };
  
  const minDepositLocal = getMinDepositForCountry(selectedCountry);
  const minDepositUSD = minDepositLocal / exchangeRate;

  // Quick amounts based on minimum
  const getQuickAmounts = () => {
    const min = minDepositLocal;
    return [
      min,
      min * 2,
      min * 5,
      min * 10,
      min * 20,
      min * 50
    ];
  };
  const quickAmounts = getQuickAmounts();

  // All available countries list
  const allCountries = Object.values(COUNTRIES);

  // Filter countries by search query
  const filteredCountries = allCountries.filter(c =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    c.currency.toLowerCase().includes(countrySearchQuery.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Group countries by region
  const groupedCountries = filteredCountries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  // Detect country on mount
  useEffect(() => {
    if (isOpen) {
      detectCountry();
    }
  }, [isOpen]);

  const detectCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_code;
      
      if (COUNTRIES[countryCode]) {
        setDetectedCountry(countryCode);
        setSelectedCountry(countryCode);
      } else {
        setDetectedCountry('US');
        setSelectedCountry('US');
      }
    } catch (error) {
      setDetectedCountry('US');
      setSelectedCountry('US');
    }
  };

  if (!isOpen) return null;

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    setSelectedMethod('bank');
    setStep('amount');
  };

  const handleEwalletSelect = (ewallet: string) => {
    setSelectedEwallet(ewallet);
    setSelectedMethod('ewallet');
    setStep('amount');
  };

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
    setSelectedMethod('crypto');
    setStep('amount');
  };

  const handleSpecialMethodSelect = (method: string, type: PaymentMethod) => {
    setSelectedSpecialMethod(method);
    setSelectedMethod(type);
    setStep('amount');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const localAmount = parseFloat(value) || 0;
    const usdAmount = localAmount / exchangeRate;
    setAmountUSD(usdAmount);
  };

  const handleAmountSubmit = async () => {
    if (!amount || parseFloat(amount) < minDepositLocal) {
      alert(`Minimum deposit amount is ${country.symbol}${minDepositLocal.toLocaleString()}`);
      return;
    }

    setIsProcessing(true);

    try {
      const depositData = {
        userEmail,
        amount: parseFloat(amount),
        amountUSD,
        currency: country.currency,
        country: country.code,
        method: selectedMethod,
        bank: selectedBank,
        ewallet: selectedEwallet,
        crypto: selectedCrypto,
        specialMethod: selectedSpecialMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/deposit/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(depositData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create deposit request');
      }

      const result = await response.json();
      setPaymentInfo(result.paymentInfo);
      setStep('payment');
    } catch (error: any) {
      console.error('Deposit error:', error);
      alert('Failed to create deposit request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('method');
    setSelectedMethod(null);
    setSelectedBank(null);
    setSelectedEwallet(null);
    setSelectedCrypto(null);
    setSelectedSpecialMethod(null);
    setAmount('');
    setPaymentInfo(null);
    setCountrySearchQuery('');
    onClose();
  };

  const getPaymentMethodName = () => {
    if (selectedBank) {
      const bank = country.banks.find(b => b.code === selectedBank);
      return bank?.name || selectedBank;
    }
    if (selectedEwallet) {
      const ewallet = country.ewallets.find(e => e.code === selectedEwallet);
      return ewallet?.name || selectedEwallet;
    }
    if (selectedCrypto) {
      const crypto = CRYPTOS.find(c => c.code === selectedCrypto);
      return crypto?.name || selectedCrypto;
    }
    if (selectedSpecialMethod) {
      const special = country.specialMethods?.find(s => s.code === selectedSpecialMethod);
      return special?.name || selectedSpecialMethod;
    }
    if (selectedMethod === 'card') return 'Credit/Debit Card';
    if (selectedMethod === 'paypal') return 'PayPal';
    return '';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-3xl bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Deposit Funds</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {step === 'method' && 'Select your payment method'}
                {step === 'amount' && `Enter amount`}
                {step === 'payment' && 'Complete payment'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Country Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCountrySelector(!showCountrySelector)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all text-left group"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                <span className="text-lg sm:text-xl flex-shrink-0">{country.flag}</span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-medium text-white block truncate">{country.name}</span>
                  <span className="text-[10px] sm:text-xs text-slate-400">{country.currency} ({country.symbol})</span>
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 transition-transform flex-shrink-0 ${showCountrySelector ? 'rotate-180' : ''}`} />
            </button>

            {showCountrySelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-850 border border-slate-700/50 rounded-xl shadow-2xl max-h-72 sm:max-h-80 overflow-hidden z-20">
                {/* Search */}
                <div className="p-2.5 sm:p-3 border-b border-slate-700/50 sticky top-0 bg-slate-850/98 backdrop-blur-sm">
                  <div className="relative">
                    <Search className="absolute left-2.5 sm:left-3 top-2 sm:top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    <input
                      type="text"
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      placeholder="Search country..."
                      className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 bg-slate-900 border border-slate-700/50 rounded-lg text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Countries list */}
                <div className="max-h-56 sm:max-h-64 overflow-y-auto">
                  {Object.entries(groupedCountries).map(([region, countries]) => (
                    <div key={region}>
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800/50 border-b border-slate-700/30 sticky top-0">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{region}</span>
                      </div>
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setSelectedCountry(c.code);
                            setShowCountrySelector(false);
                            setCountrySearchQuery('');
                          }}
                          className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-b-0 ${
                            selectedCountry === c.code ? 'bg-slate-800/50' : ''
                          }`}
                        >
                          <span className="text-lg sm:text-xl flex-shrink-0">{c.flag}</span>
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-white truncate">{c.name}</div>
                            <div className="text-[10px] sm:text-xs text-slate-400">{c.currency} ({c.symbol})</div>
                          </div>
                          {selectedCountry === c.code && (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* STEP 1: Select Payment Method */}
          {step === 'method' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Bank Transfer */}
              {country.banks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                    <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400" />
                    <h3 className="text-sm sm:text-base font-semibold text-white">Bank Transfer</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {country.banks.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => handleBankSelect(bank.code)}
                        className="p-3 sm:p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all text-center group hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 ${bank.color} rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-lg group-hover:shadow-xl transition-shadow`}>
                          {bank.code.slice(0, 3).toUpperCase()}
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-white truncate">{bank.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* E-Wallet */}
              {country.ewallets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                    <Smartphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-green-400" />
                    <h3 className="text-sm sm:text-base font-semibold text-white">E-Wallet</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {country.ewallets.map((ewallet) => (
                      <button
                        key={ewallet.code}
                        onClick={() => handleEwalletSelect(ewallet.code)}
                        className="p-3 sm:p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-green-500/50 rounded-xl transition-all text-center group hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 ${ewallet.color} rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-lg group-hover:shadow-xl transition-shadow`}>
                          {ewallet.code.slice(0, 4).toUpperCase()}
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-white truncate">{ewallet.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Methods */}
              {country.specialMethods && country.specialMethods.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                    <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-400" />
                    <h3 className="text-sm sm:text-base font-semibold text-white">Instant Payment</h3>
                  </div>
                  <div className="space-y-2">
                    {country.specialMethods.map((method) => (
                      <button
                        key={method.code}
                        onClick={() => handleSpecialMethodSelect(method.code, method.type)}
                        className="w-full p-3 sm:p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 rounded-xl transition-all group hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5">
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 ${method.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                            {method.icon}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-white truncate">{method.name}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400">Fast & secure transfer</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cryptocurrency */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                  <Bitcoin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-orange-400" />
                  <h3 className="text-sm sm:text-base font-semibold text-white">Cryptocurrency</h3>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">(Global)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {CRYPTOS.map((crypto) => (
                    <button
                      key={crypto.code}
                      onClick={() => handleCryptoSelect(crypto.code)}
                      className="p-3 sm:p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-orange-500/50 rounded-xl transition-all text-center group hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 ${crypto.color} rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg group-hover:shadow-xl transition-shadow`}>
                        {crypto.symbol}
                      </div>
                      <p className="text-[11px] sm:text-xs font-medium text-white truncate">{crypto.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">{crypto.network}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Card */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                  <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400" />
                  <h3 className="text-sm sm:text-base font-semibold text-white">Card Payment</h3>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">(Global)</span>
                </div>
                <button
                  onClick={() => handleMethodSelect('card')}
                  className="w-full p-3 sm:p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all group hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">Visa / Mastercard / Amex</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">International cards accepted</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* PayPal */}
              <div>
                <button
                  onClick={() => handleMethodSelect('paypal')}
                  className="w-full p-3 sm:p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all group hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0">
                      💙
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">PayPal</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Global e-wallet</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Enter Amount */}
          {step === 'amount' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Amount Display Card */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 sm:p-5">
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs font-medium text-blue-300 mb-1.5 uppercase tracking-wider">You deposit</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1.5 tracking-tight">
                    {country.symbol} {parseFloat(amount || '0').toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 font-medium">
                    ≈ ${amountUSD.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Deposit Amount ({country.currency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder={`Minimum ${country.symbol}${minDepositLocal.toLocaleString()}`}
                  min={minDepositLocal}
                  step="1"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white text-base sm:text-lg font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-blue-500 rounded-full"></span>
                  Minimum: {country.symbol}{minDepositLocal.toLocaleString()} (≈ ${minDepositUSD.toFixed(0)} USD)
                </p>
              </div>

              {/* Quick Select */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-2">Quick Select</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleAmountChange(amt.toString())}
                      className="px-3 py-2 sm:py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-lg text-white text-[11px] sm:text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                      {country.symbol}{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 sm:gap-3 pt-2">
                <Button
                  onClick={() => {
                    setStep('method');
                    setSelectedMethod(null);
                    setSelectedBank(null);
                    setSelectedEwallet(null);
                    setSelectedCrypto(null);
                    setSelectedSpecialMethod(null);
                  }}
                  variant="outline"
                  className="flex-1 h-10 sm:h-11 text-xs sm:text-sm font-semibold border-slate-600 hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAmountSubmit}
                  disabled={isProcessing || !amount || parseFloat(amount) < minDepositLocal}
                  className="flex-1 h-10 sm:h-11 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                  {isProcessing ? 'Processing...' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Instructions */}
          {step === 'payment' && paymentInfo && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 sm:p-5">
                <div className="text-center mb-5 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    Deposit {country.symbol}{parseFloat(amount).toLocaleString()}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">via {getPaymentMethodName()}</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">≈ ${amountUSD.toFixed(2)} USD</p>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-[11px] sm:text-xs text-amber-400 font-medium">⏱ Complete within 24 hours</p>
                  </div>
                </div>

                {paymentInfo.vaNumber && (
                  <div className="bg-slate-900/80 rounded-xl p-3.5 sm:p-4 mb-3.5 sm:mb-4 border border-slate-700/30">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Virtual Account</p>
                    <p className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider mb-2">
                      {paymentInfo.vaNumber}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentInfo.vaNumber);
                        alert('Copied!');
                      }}
                      className="text-[11px] sm:text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      📋 Copy
                    </button>
                  </div>
                )}

                {paymentInfo.qrCode && (
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 mb-3.5 sm:mb-4 text-center">
                    <img src={paymentInfo.qrCode} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-lg" />
                    <p className="text-[10px] sm:text-xs text-slate-600 mt-2 font-medium">Scan with your app</p>
                  </div>
                )}

                {paymentInfo.cryptoAddress && (
                  <div className="bg-slate-900/80 rounded-xl p-3.5 sm:p-4 mb-3.5 sm:mb-4 border border-slate-700/30">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
                      {paymentInfo.cryptoNetwork} Address
                    </p>
                    <p className="text-xs sm:text-sm font-mono text-white break-all leading-relaxed mb-2">
                      {paymentInfo.cryptoAddress}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentInfo.cryptoAddress);
                        alert('Copied!');
                      }}
                      className="text-[11px] sm:text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      📋 Copy address
                    </button>
                  </div>
                )}

                <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <p className="font-semibold text-white">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                    {paymentInfo.instructions?.map((instruction: string, index: number) => (
                      <li key={index} className="pl-1">{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-3.5">
                <p className="text-[11px] sm:text-xs text-amber-300 leading-relaxed">
                  ⚠️ Deposit processed within 5-30 minutes after confirmation. Keep your receipt.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full h-10 sm:h-11 text-xs sm:text-sm font-semibold bg-slate-700 hover:bg-slate-600"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
