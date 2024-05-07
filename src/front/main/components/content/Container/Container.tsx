import { useCallback, useEffect, useRef, useState } from "react";
import * as Style from "./Container.styles";
import { Row } from "@content/Row";

export const Container = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { list } = window.Api.fetch;
    const [width, setWidth] = useState(0);
    const [packs, setPacks] = useState<PackEx[]>([]);
    const [listView, setListView] = useState(true);

    const changeWidth = useCallback(() => {
        setWidth(ref.current?.offsetWidth ?? 0);
    }, [ref.current])

    const fetchPacks = useCallback(() => {
        list().then(packs => {
           console.log("fetched", packs);
           setPacks(packs);
        });
    }, []);

    useEffect(() => {
        fetchPacks();
    }, [])

    useEffect(() => {
        changeWidth();
        window.addEventListener('resize', changeWidth, true);
        return () => window.removeEventListener('resize', changeWidth);
      }, [changeWidth]);

    return (
        <>
            {/* <Style.ViewFilter>
                <FontAwesomeIcon icon={faTableCells} onClick={() => setListView(false)} />
                <FontAwesomeIcon icon={faTableList} onClick={() => setListView(true)} />
            </Style.ViewFilter> */}
            <Style.Content id="app-content">
                <Style.Scroll id="app-content" ref={ref} $count={packs.length}>
                    {/* <span onClick={fetchPacks}>Refresh</span> */}
                    {packs.map((pack, index) => (
                        <Row key={pack.name} index={index} listView={listView} pack={pack} width={width} />
                    ))}
                </Style.Scroll>
            </Style.Content>
        </>
    )
}