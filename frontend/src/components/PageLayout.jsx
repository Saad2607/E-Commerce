const PageLayout = ({ title, subtitle, children, maxWidth = "max-w-6xl" }) => {
    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50 text-gray-900 dark:bg-[#0b0f17] dark:text-gray-100 hero-pattern transition-colors duration-300">
            <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-10 pb-20`}>
                {(title || subtitle) && (
                    <div className="mb-8">
                        {title && (
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {title}
                                </h1>
                            </div>
                        )}
                        {subtitle && (
                            <p className="mt-2 pl-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{subtitle}</p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default PageLayout;
