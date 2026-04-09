import { useEffect, useState } from "react";
import BntBasic from "../../../atoms/btnBasic/btnBasic";
import styles from "./styles.module.css";
import productos from "./products.json";
import { useNotifications } from "../../../../context/Notifications/NotificationsContext";
import { useSession } from "../../../../context/Session/SessionContext";
import { trackEvent } from "../../../../lib/firebaseAnalytics";

const formatPrice = (price) => `$${price.toLocaleString("es-CL")}`;

export default function ModalProduct({ data, onClose }) {
  const [productoActual, setProductoActual] = useState(null);
  const { sessionId } = useSession();

  useEffect(() => {
    if (!data) return;

    if (data.type === "box" && Array.isArray(productos.boxes)) {
      setProductoActual(productos.boxes[data.num_caja]);
    } else if (data.type === "logo" && Array.isArray(productos.logos)) {
      setProductoActual(productos.logos[data.num_logo]);
    } else if (data.type === "jersey" && data.team && productos.jerseys?.[data.team]) {
      setProductoActual(productos.jerseys[data.team]);
    }
  }, []);

  if (!productoActual) return null;

  return (
    <div className={styles.modalProduct}>
      <div className={styles.containerProduct}>
        <h3 className={styles.titleProduct}>
          {data?.type === "jersey"
            ? `¡DETECTAMOS LA CAMISETA DE ${productoActual.team?.toUpperCase()}! ${productoActual.descuento}% OFF`
            : `¡ENCONTRASTE UN PRODUCTO CON ${productoActual.descuento}% DE DESCUENTO!`}
        </h3>
        <div className={styles.productInfo}>
          <div className={styles.productImage}>
            <img src={productoActual.imagen} alt={productoActual.nombre} />
          </div>
          <div className={styles.productDetails}>
            <h2 className={styles.productName}>{productoActual.nombre}</h2>
            <h4 className={styles.price}>
              <small>{formatPrice(productoActual.precioSin)}</small>
              {formatPrice(productoActual.precioCon)}
            </h4>
            <BntBasic
              text={"Comprar"}
              link={productoActual.link}
              onClick={() =>
                trackEvent("comprar_click", {
                  session_id: sessionId || undefined,
                  producto_id: productoActual.id,
                  tipo_trigger: data?.type,
                  indice_reconocido: data?.type === "box" ? data?.num_caja : data?.num_logo,
                  nombre_producto: productoActual.nombre,
                  descuento_pct: productoActual.descuento,
                  link_destino: productoActual.link,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
