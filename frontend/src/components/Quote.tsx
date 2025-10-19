export const Quote = () => {
  return (
    <div className="bg-slate-200 h-screen flex justify-center flex-col px-10">
      <div className="flex justify-center">
        <div className="max-w-2xl">
          {/* Quote - Centered */}
          <div className="text-2xl font-bold mb-4">
          "The customer service I received was   exceptional. The support team went above and beyond to address my concerns."
          </div>
          
          {/* Author Info - Left Aligned (aligned with quote text) */}
          <div className="flex flex-col">
            <div className="text-xl font-semibold text-slate-900">
              Jules Winnfield
            </div>
            <div className="text-sm font-light text-slate-500">
              CEO, Acme Inc
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};