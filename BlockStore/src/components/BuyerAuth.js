import React from 'react';
import { withRouter } from "react-router";

function BuyerAuth() {

    return (
      <div styles={{ backgroundImage:`url(${bg})`}}>
      </div>
    );
}

const BuyerAuthWithRouter = withRouter(BuyerAuth);

export default BuyerAuthWithRouter;
