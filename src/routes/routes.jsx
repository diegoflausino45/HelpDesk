import styles from "./routes.module.css"
//Importação do react-router-dom
import { BrowserRouter, Routes, Route } from "react-router-dom"

//Importações de Páginas
import DashBoard from "../containers/dashboard/dashboard"
import Chamados from "../containers/chamados/chamados"
import Relatorios from "../containers/relatorios/relatorios"
import Usuarios from "../containers/usuarios/usuarios"
import Configuracoes from "../containers/configuracoes/configuracoes"
import Perfil from "../containers/perfil/perfil"
import NotFound from "../containers/notFound/notFound"
//Importações de Componentes
import Header from "../components/header/header"
import ScrollToTop from "../components/scrollToTop/scrolltoTop"

//Definição de Rotas
function RouterApp(){
    return(
        <BrowserRouter>
        <ScrollToTop/>
            <Header/>
                <div className={styles.content}>
                    <Routes>
                        <Route path="/" element={<DashBoard/>} />
                        <Route path="/chamados" element={<Chamados/>}/>
                        <Route path="/relatorios" element={<Relatorios/>}/>
                        <Route path="/usuarios" element={<Usuarios/>}/>
                        <Route path="/configuracoes" element={<Configuracoes/>}/>
                        <Route path="/perfil" element={<Perfil/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
        </BrowserRouter>
    )
}


export default RouterApp