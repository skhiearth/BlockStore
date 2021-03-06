import React from 'react';
import { withRouter } from "react-router";
import { CreateSeller } from ".";
import bg from './Assets/bg.png'
import Sawo from "sawo";

function SellerAuth() {
    let [payload, setPayload] = React.useState(false);

        React.useEffect(() => {
        var config = {
            containerID: "sawo-container",
            identifierType: "email",
            apiKey: "fcf1da27-4d2f-455f-864c-2e7a14889b9b",
            onSuccess: (payload) => {
                // console.log(payload); 
                setPayload(payload)
            },
            };
            let sawo = new Sawo(config);
            sawo.showForm();
        }, []); 

    return (
      <div styles={{ backgroundImage:`url(${bg})`}}>
          <div className="container-fluid">
            <div className="row">
                <div className="content mr-auto ml-auto">
                  <div id="sawo-container" style={{ height: "360px", width: "300px"}} ></div>
                    {payload && (
                    <>
                      <CreateSeller payload={payload} />
                    </>
                    )}
                </div>
            </div>
            
          </div>
      </div>
    );
}

const SellerAuthWithRouter = withRouter(SellerAuth);

export default SellerAuthWithRouter;
