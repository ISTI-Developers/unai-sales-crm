import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

const ClientUploadNotes = () => {
    return (
        <section className="bg-slate-50 rounded-md px-4">
            <Accordion type="single" collapsible defaultValue="guide">
                <AccordionItem value="guide" className="border-b-0">
                    <AccordionTrigger>Batch Upload Guidelines</AccordionTrigger>
                    <AccordionContent>
                        <ol className="ml-4 list-decimal">
                            <li>
                                Download the{" "}
                                <a
                                    href="/template.xlsx"
                                    className="underline text-main-400 font-bold"
                                    target="_blank"
                                    rel="noreferrer"
                                    download={"Client Batch Upload Template"}
                                >
                                    template attached
                                </a>{" "}
                                and fill in all required details. Required columns has a{" "}
                                <strong className="text-red-100">red asterisk (*)</strong>.
                            </li>
                            <li>Upload the completed file below.</li>
                            <li>
                                NOTE: This form only accepts up to{" "}
                                <strong>100 rows per upload</strong>.
                            </li>
                            <li>
                                Once uploaded, thoroughly review for any errors before
                                saving. Do not close the tab or the browser while the file
                                has not finished uploading yet.
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    )
}

export default ClientUploadNotes