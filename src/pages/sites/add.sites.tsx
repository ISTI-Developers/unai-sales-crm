import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputNumber from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInsertSite, useLatestSites, useSiteLastInserted, useSites } from '@/hooks/useSites'
import { NewSite } from '@/interfaces/sites.interface';
import { capitalize } from '@/lib/utils';
import Page from '@/misc/Page';
import { ChevronLeft } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';

const AddSite = () => {
    const { data: date } = useSiteLastInserted()
    const { data: sites } = useSites();
    const { data: newSites } = useLatestSites(date);
    const { mutate: importSite } = useInsertSite();

    const navigate = useNavigate();

    const [selectedUNISSite, setSelectedUNISSite] = useState<string>()
    const [site, setSite] = useState<NewSite>()

    const finalSites = useMemo(() => {
        console.count("render");
        if (!sites || !newSites) return [];

        return newSites.filter(ns => {
            return !sites.some(s => ns.structure_code === s.structure_code);
        })
    }, [sites, newSites]);


    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!site) return;

        importSite({ columns: Object.keys(site), values: Object.values(site) }, {
            onSuccess: () => {
                navigate("/sites");
            }
        })
    }
    return (
        <Page className="flex flex-col gap-4">
            <Helmet>
                <title>Add | Sites | Sales Platform</title>
            </Helmet>
            <header className="flex items-center justify-between border-b pb-1.5">
                <h1 className="text-blue-500 font-bold uppercase">Add Site</h1>
                <Button variant="link" type="button" asChild>
                    <Link to="/sites">
                        <ChevronLeft /> Back
                    </Link>
                </Button>
            </header>
            <main className='space-y-2'>
                <div className='w-1/3'>
                    <Label htmlFor='site'>Fetch site details from UNIS</Label>
                    <Select onValueChange={(value) => {
                        setSelectedUNISSite(value);

                        const unisSite = finalSites.find(s => s.site_code === value);
                        if (!unisSite) return;
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { structure_id, date_created, ...details } = structuredClone(unisSite);
                        setSite({ ...details, ideal_view: "" });
                    }} value={selectedUNISSite}>
                        <SelectTrigger>
                            <SelectValue placeholder="select site" />
                        </SelectTrigger>
                        <SelectContent>
                            {finalSites.map(site => {
                                return <SelectItem key={site.site_code} value={site.site_code}>
                                    {site.site_code}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <hr />
                {site &&
                    <form className='space-y-4' onSubmit={onSubmit}>
                        <div className='grid grid-rows-7 grid-flow-col gap-2 gap-x-4'>
                            {Object.keys(site).map(key => {
                                const InputType = key === "vicinity_population" || key === "traffic_count" ? InputNumber : Input;

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

export default AddSite