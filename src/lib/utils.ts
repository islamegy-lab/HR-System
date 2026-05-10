import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ar-SA').format(new Date(date))
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    active:     'bg-emerald-50 text-emerald-700',
    inactive:   'bg-slate-100 text-slate-600',
    on_leave:   'bg-amber-50 text-amber-700',
    terminated: 'bg-red-50 text-red-700',
    pending:    'bg-amber-50 text-amber-700',
    approved:   'bg-emerald-50 text-emerald-700',
    rejected:   'bg-red-50 text-red-700',
    draft:      'bg-slate-100 text-slate-600',
    confirmed:  'bg-blue-50 text-blue-700',
    paid:       'bg-emerald-50 text-emerald-700',
    present:    'bg-emerald-50 text-emerald-700',
    absent:     'bg-red-50 text-red-700',
    late:       'bg-orange-50 text-orange-700',
    open:       'bg-blue-50 text-blue-700',
    closed:     'bg-slate-100 text-slate-600',
  }
  return colors[status] || 'bg-slate-100 text-slate-600'
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    on_leave: 'في إجازة',
    terminated: 'منتهي',
    pending: 'قيد الانتظار',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    cancelled: 'ملغي',
    draft: 'مسودة',
    confirmed: 'مؤكد',
    paid: 'مدفوع',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    half_day: 'نصف يوم',
    full_time: 'دوام كامل',
    part_time: 'دوام جزئي',
    contract: 'عقد',
    intern: 'متدرب',
    open: 'مفتوح',
    closed: 'مغلق',
    new: 'جديد',
    screening: 'فرز',
    interview: 'مقابلة',
    offer: 'عرض',
    hired: 'تم التوظيف',
    planned: 'مخطط',
    ongoing: 'جاري',
    completed: 'مكتمل',
  }
  return labels[status] || status
}
