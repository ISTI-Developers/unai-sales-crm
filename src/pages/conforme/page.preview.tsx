import { Conforme, PaymentTiming } from '@/interfaces/requests.interface'
import { format } from 'date-fns';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import DocumentPage from './page';
import { BillingPeriod, Header, ListBlock, MonthlyContractTerm } from './page.components';
import { cn } from '@/lib/utils';
import LesseeSection from './section.lessee';
import SitesSection from './section.sites';
import { formatAmount } from '@/lib/format';
import AcknowledgementSection from './section.acknowledgement';

interface PagePreviewProps {
    conforme: Conforme;
}
function PagePreview({ conforme }: PagePreviewProps) {
    const renderDate = () => <p data-page-block="Date" className='ml-auto'>{format(new Date(), "MMMM dd, yyyy")}</p>;
    const [pages, setPages] = useState<React.ReactNode[][]>([]);
    const [measurements, setMeasurements] = useState<{
        id: number;
        label: string | null;
        height: number;
        element: Element
    }[]>([])
    const contentRef = useRef<HTMLDivElement>(null);
    const pageMeasureRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(1123);

    const sections = useMemo(() => {
        const termsAndConditions = Object.values(conforme.terms);
        const mappedTerms = termsAndConditions.map(term => {
            if (Array.isArray(term)) {
                const otherTerms = term.filter(item => item.use).map(item => {
                    return <ListBlock className={cn(item.isBold ? "font-semibold" : "", item.isItalic ? "italic" : "")}>
                        {item.label && <span className={cn(item.isBold ? "" : "font-semibold")}>{item.label}: </span>}
                        <span>{item.content.replace("[value]", "")}</span>
                        {item.value && <span>{formatAmount(item.value)}</span>}
                    </ListBlock>
                });
                return otherTerms;
            }

            if (Object.keys(term).includes("payment_method")) {
                return <BillingPeriod {...term as PaymentTiming} />
            }
            return <MonthlyContractTerm rules={term} />
        })

        const terms = [
            <ListBlock className='font-semibold'>
                Payment Terms
            </ListBlock>,
            ...mappedTerms.flat()];
        return [
            renderDate(),
            <Header title='01 Lessee Information' />,
            <LesseeSection conforme={conforme} />,
            <Header title='02 Site Specifications' />,
            <SitesSection conforme={conforme} />,
            <Header title='03 Terms and Conditions' />,
            ...terms,
            <AcknowledgementSection conforme={conforme} />
        ]
    }, [conforme]);
    useEffect(() => {
        const element = pageMeasureRef.current;

        if (!element) return;

        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;

            const pageHeight = width * (11.69 / 8.27);

            setHeight(pageHeight);
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!contentRef.current) return;
        const page = contentRef.current;

        const blocks = page.querySelectorAll("[data-page-block]");

        const measurements = Array.from(blocks).map((block, index) => ({
            id: index,
            label: block.getAttribute("data-page-block"),
            height: block.getBoundingClientRect().height,
            element: block
        }));

        setMeasurements(measurements)
    }, [sections])
    useEffect(() => {
        if (!measurements) return;

        const pageContentHeight = height - (height * .4);

        const generatedPages: ReactNode[][] = []
        let currentPage: ReactNode[] = [];
        let currentHeight = 0

        measurements.forEach(measurement => {
            if (currentPage.length > 0 && currentHeight + measurement.height > pageContentHeight) {
                generatedPages.push(currentPage);
                currentPage = [];
                currentHeight = 0;
            }

            currentPage.push(sections[measurement.id]);
            currentHeight += measurement.height
        });

        if (currentPage.length > 0) {
            generatedPages.push(currentPage);
        }

        setPages(generatedPages);
    }, [height, measurements, sections]);
    return (
        <>
            <div
                ref={contentRef}
                className=" absolute left-[-99999px] top-0 w-[8.27in] pointer-events-none invisible"
            >
                <main className=" text-[0.65rem] px-7 flex flex-col gap-1 leading-tight "
                >
                    {sections.map((block) => (block))}
                </main>
            </div>
            {pages.map((page, index) => {
                return <DocumentPage pageNumber={index + 1}>
                    <main className={cn('text-[0.65rem] flex-1 min-h-0 px-7 flex flex-col gap-1 leading-tight z-[10]', index === 0 ? "-my-4" : "")}>
                        {page.map(block => (block))}
                    </main>
                </DocumentPage>
            })}
        </>
    )
}

export default PagePreview