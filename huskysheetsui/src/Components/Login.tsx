import React from "react";

import { useHistory } from 'react-router-dom';
interface ILogin{}

const Login: React.FC<ILogin> = () => {
    const history = useHistory();
    const handleLogin = () =>{
            history.push("/home")
    }

    return <div onClick={handleLogin}>Go to HomePage</div>
}

export{Login}