import { Jupyter } from '../../../jupyter/Jupyter';
// import Cell from '../../../components/cell/Cell';

const CellComponent = () => {
  return (
    <>
      <Jupyter startDefaultKernel={true}>
        {/*
        <Cell source="print('Hello 🪐 ⚛️ Jupyter React')"/>
        */}
      </Jupyter>
    </>
  )
}

export default CellComponent;
