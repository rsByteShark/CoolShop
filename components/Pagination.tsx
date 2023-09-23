import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import styles from '@/styles/Home.module.scss'
import { PaginationProps } from "@/typings/types";

function Pagination({ t, paginationConfig, changeElementsPerPage, changePage }: PaginationProps) {

    return (

        <div className={`${styles.pagination}`}>
            <div style={{ marginRight: "1vw" }}>{t.itemsPerPage}</div>
            <select
                onChange={changeElementsPerPage}
                style={{ marginRight: "1vw" }}
                defaultValue={paginationConfig.elementsPerPage}>
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
            </select>
            <div style={{ marginRight: "1vw" }}>{`${paginationConfig.firstVisableCardIndex} - ${paginationConfig.lastVisableCardIndex} of ${paginationConfig.quantityOfElements}`}</div>
            {paginationConfig.isMoreThenOnePage ?

                <div style={{ display: "flex" }}>
                    <div onClick={changePage.bind(undefined, "backward")}>
                        <KeyboardArrowLeftIcon
                            color={paginationConfig.isFirstPage ? "disabled" : undefined}
                            className={paginationConfig.isFirstPage ? "" : `${styles.paginationNavigation}`} />
                    </div>
                    <div onClick={paginationConfig.isLastPage ? () => { } : changePage.bind(undefined, "forward")}>
                        <KeyboardArrowRightIcon
                            color={paginationConfig.isLastPage ? "disabled" : undefined}
                            className={paginationConfig.isLastPage ? "" : `${styles.paginationNavigation}`} />
                    </div>
                </div> :

                <div>
                    <KeyboardArrowLeftIcon color='disabled' />
                    <KeyboardArrowRightIcon color='disabled' />
                </div>
            }
        </div>

    );
}

export default Pagination;