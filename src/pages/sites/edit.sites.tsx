import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputNumber from '@/components/ui/number-input';
import { useSite, useUpdateSite } from '@/hooks/useSites'
import { Site } from '@/interfaces/sites.interface';
import { capitalize } from '@/lib/utils';
import Page from '@/misc/Page';
import { ChevronLeft } from 'lucide-react';
import { FormEvent, useState } from 'react'
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';

const EditSite = () => {
    const { id } = useParams();
    const { data } = useSite(id);
    const navigate = useNavigate();

    const [site, setSite] = useState<Site | null>(data)
    const { mutate: updateSite } = useUpdateSite();

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!site) return;

        updateSite({ columns: Object.keys(site), values: Object.values(site), site_id: site.ID, type: "site" }, {
            onSuccess: () => {
                navigate("/sites");
            }
        })
    }
    return (
        <Page className="flex flex-col gap-4">
            <Helmet>
                <title>Edit | Sites | Sales Platform</title>
            </Helmet>
            <header className="flex items-center justify-between border-b pb-1.5">
                <h1 className="text-blue-500 font-bold uppercase">Edit Site</h1>
                <Button variant="link" type="button" asChild>
                    <Link to="/sites">
                        <ChevronLeft /> Back
                    </Link>
                </Button>
            </header>
            <main className='space-y-2'>
                {site &&
                    <form className='space-y-4' onSubmit={onSubmit}>
                        <div className='grid grid-rows-8 grid-flow-col gap-2 gap-x-4'>
                            {Object.keys(site).filter(key => !['remarks', 'created_at', 'status', 'ID'].includes(key)).map(key => {
                                const InputType = key === "vicinity_population" || key === "traffic_count" || key === "price" ? InputNumber : Input;

                                return <div key={key} className='grid grid-cols-[200px_auto] items-center gap-2'>
                                    <Label>{capitalize(key, "_")}</Label>
                                    <InputType required id={key} value={site[key as keyof typeof site] ?? ""} onChange={(e) => setSite(prev => {
                                        if (!prev) return prev;
                                        return {
                                            ...prev,
                                            [key]: e.target.value ?? ""
                                        }
                                    })} />
                                </div>
                            })}
                        </div>
                        <Button
                            type="submit"
                            variant="ghost"
                            // disabled={!isReady || loading}
                            className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white flex gap-4 ml-auto disabled:cursor-not-allowed"
                        >
                            {/* {loading && <LoaderCircle className="animate-spin" />} */}
                            <span>Save</span>
                        </Button>
                    </form>
                }
            </main>
        </Page>
    )
}

export default EditSite