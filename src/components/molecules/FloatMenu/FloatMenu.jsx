import { useCardModal, MODAL_TYPES } from "../../../context/CardModal";
import style from "./styles.module.css";

const menuItems = [
  {
    image: "icons/ico-minute-minute.svg",
    type: "minutetominute",
    name: "Minuto a Minuto",
  },
  {
    image: "icons/ico-bag.svg ",
    type: "cart",
    name: "Tienda",
  },
];

export default function FloatMenu() {
 const { openModal } = useCardModal();

 const handleItemClick = (type) => {
   if (type === "minutetominute") {
     openModal(MODAL_TYPES.MINUTE_TO_MINUTE, 'data');
   } else if (type === "cart") {
     openModal(MODAL_TYPES.CART, 'data');
   }
 };

 return (
  <div className={style.floatMenuContainer}>
   {menuItems.map((item) => (
     <div
       key={item.type}
       className={style.itemMenu}
       onClick={() => handleItemClick(item.type)}
     >
       <img src={item.image} alt={item.name} />
     </div>
   ))}
  </div>
 )
}