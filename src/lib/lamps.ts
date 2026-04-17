export type Lamp = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  color: string;
  accent: string;
  description: string;
};

/**
 * Dùng gradient SVG generate trực tiếp để khỏi cần ảnh thật trong MVP.
 * Khi có ảnh product chụp thật, thay bằng src image tĩnh trong /public/lamps/.
 */
export const LAMPS: Lamp[] = [
  {
    id: "lumos",
    name: "Lumos",
    tagline: "Cầu ánh sáng ấm cho góc đọc",
    price: 420_000,
    color: "#fbcfe8",
    accent: "#be185d",
    description:
      "Hình khối cầu in dạng vân xoắn, ánh sáng hổ phách 2700K, dimmer xoay mềm.",
  },
  {
    id: "orbit",
    name: "Orbit",
    tagline: "Đèn bàn vệ tinh xoay 360°",
    price: 560_000,
    color: "#bfdbfe",
    accent: "#1d4ed8",
    description:
      "Thân lục giác lắp ghép, đầu đèn gắn nam châm dịch chuyển tự do quanh bệ.",
  },
  {
    id: "sakura",
    name: "Sakura",
    tagline: "Đèn cánh hoa treo phòng ngủ",
    price: 380_000,
    color: "#fce7f3",
    accent: "#ec4899",
    description:
      "Mười hai cánh in mỏng 0.6mm cho ánh sáng xuyên qua như hoa anh đào.",
  },
  {
    id: "dune",
    name: "Dune",
    tagline: "Đèn sàn vân cát sa mạc",
    price: 820_000,
    color: "#fef3c7",
    accent: "#b45309",
    description:
      "Cao 45cm, in vân ngang mô phỏng đồi cát, ánh sáng 3000K rọi ngược lên trần.",
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "Đèn ngủ dải thiên hà",
    price: 290_000,
    color: "#ddd6fe",
    accent: "#6d28d9",
    description:
      "Chụp hình xoắn ốc, ánh sáng xoay chậm tạo hiệu ứng dải ngân hà trên tường.",
  },
  {
    id: "pebble",
    name: "Pebble",
    tagline: "Đèn viên sỏi để bàn",
    price: 210_000,
    color: "#d1fae5",
    accent: "#047857",
    description:
      "Khối tròn trịa 9cm, sạc USB-C, chạm 2 lần đổi chế độ ánh sáng.",
  },
];
