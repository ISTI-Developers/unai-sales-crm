import Container from '@/misc/Container'
import Page from '@/misc/Page'
import CreateConforme from '@/pages/conforme/create'
import Main from '@/pages/conforme/main'
import ViewConforme from '@/pages/conforme/view'
import { Helmet } from 'react-helmet'
import { Route, Routes } from 'react-router-dom'

const Conforme = () => {
    return (
        <Container title="Conforme" className='p-0'>
            <Helmet>
                <title>Conforme | Sales Platform</title>
            </Helmet>
            <Page className='space-y-4'>
                <Routes>
                    <Route index element={<Main />} />
                    <Route path=":request_no" element={<ViewConforme />} />
                    <Route path="create" element={<CreateConforme />} />
                </Routes>
            </Page>
        </Container>
    )
}


export default Conforme