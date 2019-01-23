import React from 'react';

const layout =(props) => {
    return (
        <>
        <div>Toolbar, SideDraw, Backdrop</div>
        <main>
            {props.children}
        </main>
        </>
    )
};

export default layout;