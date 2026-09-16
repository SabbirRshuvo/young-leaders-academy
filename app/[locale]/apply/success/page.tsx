import Link from 'next/link';
import { CheckCircle2, Receipt, ArrowRight } from 'lucide-react';

export default function ApplySuccessPage({
  searchParams,
  params
}: {
  searchParams: { id?: string };
  params: { locale: string };
}) {
  const paymentId = searchParams.id;
  const isAr = params.locale === 'ar';

  return (
    <div className="w-full min-h-screen bg-[#FCFAF6] py-16 md:py-24 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-gray-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2545] mb-4">
          {isAr ? 'تم استلام طلبك والدفع بنجاح!' : 'Application & Payment Successful!'}
        </h1>
        
        <p className="text-gray-600 text-lg mb-8 max-w-md">
          {isAr 
            ? 'شكراً لك. لقد استلمنا طلبك بنجاح وسنقوم بمراجعته قريباً. تم تأكيد الدفع.' 
            : 'Thank you. Your application has been received and your payment is confirmed. We will review it shortly.'}
        </p>

        {paymentId && (
          <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 text-[#0B2545] font-bold border-b border-gray-200 pb-3">
              <Receipt className="w-5 h-5" />
              <span>{isAr ? 'تفاصيل المعاملة' : 'Transaction Details'}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-500">{isAr ? 'رقم الطلب' : 'Order ID'}:</span>
              <span className="font-mono font-medium text-[#0B2545] text-xs md:text-sm">{paymentId}</span>
            </div>
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-500">{isAr ? 'الحالة' : 'Status'}:</span>
              <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md uppercase">
                {isAr ? 'مدفوع' : 'PAID'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm md:text-base mt-2 pt-4 border-t border-gray-200">
              <span className="text-gray-800 font-bold">{isAr ? 'المبلغ الإجمالي (شامل الضريبة)' : 'Total Paid (Inc. VAT)'}:</span>
              <span className="font-bold text-[#D4AF37] text-lg">1,725 SAR</span>
            </div>
          </div>
        )}

        <Link
          href={`/${params.locale}`}
          className="inline-flex items-center justify-center gap-2 bg-[#0B2545] text-white px-8 py-4 rounded-full font-bold transition-all hover:bg-[#1a365d] shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          {isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
