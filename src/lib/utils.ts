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
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-orange-100 text-orange-800',
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
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
