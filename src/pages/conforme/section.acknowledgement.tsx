import { Conforme } from '@/interfaces/requests.interface';
import { memo, useEffect, useState } from 'react';

function AcknowledgementSection({ conforme }: { conforme: Conforme }) {
    const rowCount = Math.max(
        conforme.internal_signatory.length,
        conforme.external_signatory.length
    );

    return (
        <main data-page-block className="mt-4 px-4">
            <p>
                Should you find the above provisions agreeable, kindly signify
                your conformity on the space provided below.
            </p>

            <table className="mt-4 w-full">
                <thead>
                    <tr>
                        <td>Respectfully,</td>
                        <td>Conforme</td>
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: rowCount }).map((_, index) => {
                        const internal =
                            conforme.internal_signatory[index];

                        const external =
                            conforme.external_signatory[index];

                        return (
                            <tr key={index}>
                                <td className="align-top">
                                    {internal && (
                                        <>
                                            <SignatureCell
                                                value={internal.signature}
                                            />

                                            <p className="capitalize">
                                                {internal.name}
                                            </p>

                                            <p className="capitalize">
                                                {internal.title}
                                            </p>
                                        </>
                                    )}
                                </td>

                                <td className="align-top">
                                    {external && (
                                        <>
                                            <SignatureCell
                                                value={external.signature}
                                            />

                                            <p className="capitalize">
                                                {external.name}
                                            </p>

                                            <p className="capitalize">
                                                {external.title}
                                            </p>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </main>
    );
}

const SignatureCell = memo(({ value }: { value?: File }) => {
    const [previewUrl, setPreviewUrl] = useState<string>();

    useEffect(() => {
        if (!value) {
            setPreviewUrl(undefined);
            return;
        }

        const url = URL.createObjectURL(value);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [value]);

    return (
        <div className="w-48">
            <div className="flex h-16 items-start justify-start">
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Signature"
                        className="max-h-20 max-w-full object-contain"
                    />
                )}
            </div>
            {!previewUrl &&
                <div className="border-b border-black max-w-[75%]" />
            }
        </div>
    );
})

export default AcknowledgementSection;