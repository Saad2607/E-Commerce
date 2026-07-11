const PageLayout = ({ title, subtitle, children, maxWidth = "max-w-6xl" }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition duration-300">
            <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-8`}>
                {(title || subtitle) && (
                    <div className="mb-8">
                        {title && (
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="mt-1 text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default PageLayout;
