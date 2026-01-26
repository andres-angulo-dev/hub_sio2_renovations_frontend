import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";


export interface LinkItem {
    label: string;
    url: string;
    icon?: React.ReactNode;
}

export const links: LinkItem[] = [
    {
        label: "Site Web",
        url: "https://www.sio2renovations.com/",
        icon: <FontAwesomeIcon icon={faGlobe} style={{color: "black"}}/>,
    },
    {
        label: "Instagram",
        url: "https://www.instagram.com/sio2renovations/",
        icon: <FontAwesomeIcon icon={faInstagram} style={{color: "black"}} />,
    },
    {
        label: "LinkedIn",
        url: "https://www.linkedin.com/company/sio2renovations",
        icon: <FontAwesomeIcon icon={faLinkedin} style={{color: "black"}} />,
    },
] 