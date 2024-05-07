import * as Style from "./Row.styles";

interface RowProps {
    index: number;
    width: number;
    listView: boolean;
    pack: PackEx;
}

export const Row = ({ pack, index, listView, width }: RowProps) => (
    <Style.Pack $list={listView} $index={index} $width={width}>
        <Style.Icon src={pack.img} />
        <Style.Name>{pack.collection}</Style.Name>
        <Style.Name>{pack.type}</Style.Name>
        <Style.Name>{pack.name}</Style.Name>
        <Style.Name>{pack.tags.join(', ')}</Style.Name>
        {pack.packagePath && <button>Open</button>}
    </Style.Pack>
)