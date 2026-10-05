import { ReactNode } from 'react';

interface DocumentPageProps {
    children: ReactNode;
    pageNumber: number;
}

function DocumentPage({
    children,
    pageNumber,
}: DocumentPageProps) {
    return (
        <div
            className="
                aspect-[8.27/11.69]
                print:aspect-auto
                bg-white
                mx-auto
                w-full
                max-w-[8.27in]
                print:max-w-full
                border
                print:border-none
                flex
                flex-col
            "
        >
            <header className="print:fixed print:top-0 print:left-0">
                <img src="/header2.png" alt="" />
            </header>

            {children}

            <footer className="print:fixed print:bottom-0 print:left-0 relative">
                <img src="/footer.png" alt="" />

                <p className="absolute bottom-4 right-8">
                    Page {pageNumber}
                </p>
            </footer>
        </div>
    );
}

export default DocumentPage;