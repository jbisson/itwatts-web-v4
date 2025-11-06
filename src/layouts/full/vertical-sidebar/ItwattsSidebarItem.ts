import {
  ChartPieIcon,
  CoffeeIcon,
  CpuIcon,
  FlagIcon,
  BasketIcon,
  ApertureIcon,
  LayoutGridIcon,
  BoxIcon,
  Message2Icon,
  FilesIcon,
  CalendarIcon,
  UserCircleIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ChartLineIcon,
  ChartAreaIcon,
  ChartDotsIcon,
  ChartArcsIcon,
  ChartCandleIcon,
  ChartDonut3Icon,
  ChartRadarIcon,
  LayoutIcon,
  CardboardsIcon,
  PhotoIcon,
  FileTextIcon,
  BoxAlignBottomIcon,
  BoxAlignLeftIcon,
  FileDotsIcon,
  EditCircleIcon,
  AppsIcon,
  BorderAllIcon,
  BorderHorizontalIcon,
  BorderInnerIcon,
  BorderTopIcon,
  BorderVerticalIcon,
  BorderStyle2Icon,
  LoginIcon,
  UserPlusIcon,
  RotateIcon,
  ZoomCodeIcon,
  SettingsIcon,
  AlertCircleIcon,
  BrandTablerIcon,
  CodeAsterixIcon,
  BrandCodesandboxIcon,
  CircleDotIcon,
  ColumnsIcon,
  RowInsertBottomIcon,
  EyeTableIcon,
  SortAscendingIcon,
  PageBreakIcon,
  FilterIcon,
  BoxModelIcon,
  ServerIcon,
  JumpRopeIcon,
  LayoutKanbanIcon

} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  security?: string[];
  subCaption?: string;
}

const sidebarItem: menu[] = [
  {
    header: 'menu.fera.title',    
    security: ['SUPER_ADMIN', 'FERA']
  },
  {
    title: "menu.fera.info",
    to: "/itwatts/fera/info",
    security: ['SUPER_ADMIN', 'FERA']
  },
  {
    title: "menu.fera.rider",
    to: "/itwatts/fera/rider",
    security: ['SUPER_ADMIN', 'FERA']
  },
  {
    title: "menu.fera.allRiders",
    to: "/itwatts/fera/all-riders",
    security: ['SUPER_ADMIN', 'FERA']
  },
  {
    title: "menu.fera.validations",
    to: "/itwatts/fera/validations",
    security: ['SUPER_ADMIN', 'FERA']
  },
  {
    title: "menu.fera.transparency",
    to: "/itwatts/fera/transparency",
    security: ['SUPER_ADMIN', 'FERA']
  },
  {
    title: 'menu.fera.title',
    to: "/itwatts/fera",
    security: ['SUPER_ADMIN', 'FERA']
  },  
  { 
    header: 'menuSwat.admin.title',
    security: ['SUPER_ADMIN', 'SWAT_WTRL_TTT_ADMIN', 'SWAT_CLUB_LADDER_ADMIN']
  },
  {
    title: "menuSwat.swat.members",
    to: "/itwatts/team/swat/members",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.swat.participation",
    to: "/itwatts/team/swat/participation",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.swat.registerTTT",
    to: "/itwatts/team/swat/register-ttt",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.swat.registerClubLadder",
    to: "/itwatts/team/swat/register-clubladder",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.swat.register-zrl",
    to: "/itwatts/team/swat/register-zrl",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.discord",
    to: "/itwatts/team/swat/admin/discord",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.zwiftPower",
    to: "/itwatts/team/swat/admin/zwiftpower",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.swatInterestForms",
    to: "/itwatts/team/swat/admin/swat-interest-forms",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.swatGuestForms",
    to: "/itwatts/team/swat/admin/swat-guest-forms",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.swatMembers",
    to: "/itwatts/team/swat/admin/swat-members",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.swatGuests",
    to: "/itwatts/team/swat/admin/swat-guests",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.wtrlTTTRegistrations",
    to: "/itwatts/team/swat/admin/wtrlttt-registrations",
    security: ['SUPER_ADMIN', 'SWAT_WTRL_TTT_ADMIN']
  },
  {
    title: "menuSwat.admin.clubLadderRegistrations",
    to: "/itwatts/team/swat/admin/clubladder-registrations",
    security: ['SUPER_ADMIN', 'SWAT_CLUB_LADDER_ADMIN', 'SWAT_CLUB_LADDER_CAP']
  },  
  {
    title: "menuSwat.admin.zrl20252026Round2Registrations",
    to: "/itwatts/team/swat/admin/zrl20252026-round2-registrations",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.admin.swatAcademyRegistrations",
    to: "/itwatts/team/swat/admin/swat-academy-registrations",
    security: ['SUPER_ADMIN', 'SWAT_MENTORS']
  },
  {
    title: "menuSwat.admin.2025poll",
    to: "/itwatts/team/swat/admin/2025poll-registrations",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menuSwat.atomasRace.title",
    to: "/itwatts/atomas/results",
    security: ['SUPER_ADMIN']
  },
  { 
    header: 'menu.superAdmin.title',
    security: ['SUPER_ADMIN']
  },
  {
    title: "menu.superAdmin.teams",
    to: "/itwatts/super-admin/teams",
    security: ['SUPER_ADMIN']
  },
  {
    title: "menu.superAdmin.users",
    to: "/itwatts/super-admin/users",
    security: ['SUPER_ADMIN']
  },
  { 
    header: 'Home',
    security: ['DEV_ONLY'],
   },
  {
    title: "Analytical",
    icon: ChartPieIcon,
    to: "/dashboards/analytical",
    security: ['DEV_ONLY'],
  },
  {
    title: "Classic",
    icon: CoffeeIcon,
    to: "/dashboards/classic",
    security: ['DEV_ONLY'],
  },
  {
    title: "Demographical",
    icon: CpuIcon,
    to: "/dashboards/demographical",
    security: ['DEV_ONLY'],
  },
  {
    title: "Minimal",
    icon: FlagIcon,
    to: "/dashboards/minimal",
    security: ['DEV_ONLY'],
  },
  {
    title: "eCommerce",
    icon: ShoppingCartIcon,
    to: "/dashboards/ecommerce",
    security: ['DEV_ONLY'],
  },
  {
    title: "Modern",
    icon: ApertureIcon,
    to: "/dashboards/modern",
    security: ['DEV_ONLY'],
  },
  { 
    header: "Apps",
    security: ['DEV_ONLY'],
  },
  {
    title: "Contact",
    icon: BoxIcon,
    to: "/apps/contacts",
    chip: "2",
    chipColor: "surface",
    chipBgColor: "secondary",
    security: ['DEV_ONLY'],
  },

  {
    title: "Blog",
    icon: ChartDonut3Icon,
    to: "/blog",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Posts",
        icon: CircleDotIcon,
        to: "/apps/blog/posts",
      },
      {
        title: "Detail",
        icon: CircleDotIcon,
        to: "/apps/blog/early-black-friday-amazon-deals-cheap-tvs-headphones",
      },
    ],
  },
  {
    title: "E-Commerce",
    icon: BasketIcon,
    to: "/ecommerce/",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Shop",
        icon: CircleDotIcon,
        to: "/apps/ecommerce/products",
      },
      {
        title: "Detail",
        icon: CircleDotIcon,
        to: "/apps/ecommerce/product/detail/1",
      },
      {
        title: "List",
        icon: CircleDotIcon,
        to: "/apps/ecommerce/productlist",
      },
      {
        title: "Checkout",
        icon: CircleDotIcon,
        to: "/apps/ecommerce/checkout",
      },
    ],
  },
  {
    title: "Chats",
    icon: Message2Icon,
    to: "/apps/chats",
    security: ['DEV_ONLY'],
  },
  {
    title: "User Profile",
    icon: UserCircleIcon,
    to: "/user",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Profile",
        icon: CircleDotIcon,
        to: "/apps/user/profile",
      },
      {
        title: "Followers",
        icon: CircleDotIcon,
        to: "/apps/user/profile/followers",
      },
      {
        title: "Friends",
        icon: CircleDotIcon,
        to: "/apps/user/profile/friends",
      },
      {
        title: "Gallery",
        icon: CircleDotIcon,
        to: "/apps/user/profile/gallery",
      },
    ],
  },
  {
    title: "Notes",
    icon: FilesIcon,
    to: "/apps/notes",
    security: ['DEV_ONLY'],
  },
  {
    title: "Calendar",
    icon: CalendarIcon,
    to: "/apps/calendar",
    security: ['DEV_ONLY'],
  },
  {
    title: 'Kanban',
    icon: LayoutKanbanIcon,
    to: '/apps/kanban',
    security: ['DEV_ONLY'],
  },


  { 
    header: "Components",
    security: ['DEV_ONLY'],
  },
  {
    title: "Ui Components",
    icon: BoxIcon,
    to: "#",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Alert",
        icon: CircleDotIcon,
        to: "/ui-components/alert",
      },
      {
        title: "Accordion",
        icon: CircleDotIcon,
        to: "/ui-components/accordion",
      },
      {
        title: "Avatar",
        icon: CircleDotIcon,
        to: "/ui-components/avatar",
      },
      {
        title: "Chip",
        icon: CircleDotIcon,
        to: "/ui-components/chip",
      },
      {
        title: "Dialog",
        icon: CircleDotIcon,
        to: "/ui-components/dialogs",
      },
      {
        title: "List",
        icon: CircleDotIcon,
        to: "/ui-components/list",
      },
      {
        title: "Menus",
        icon: CircleDotIcon,
        to: "/ui-components/menus",
      },
      {
        title: "Rating",
        icon: CircleDotIcon,
        to: "/ui-components/rating",
      },
      {
        title: "Tabs",
        icon: CircleDotIcon,
        to: "/ui-components/tabs",
      },
      {
        title: "Tooltip",
        icon: CircleDotIcon,
        to: "/ui-components/tooltip",
      },
      {
        title: "Typography",
        icon: CircleDotIcon,
        to: "/ui-components/typography",
      },
    ],
  },

  { 
    header: "Charts",
    security: ['DEV_ONLY'],
  },
  {
    title: "Line",
    icon: ChartLineIcon,
    to: "/charts/line-chart",
    security: ['DEV_ONLY'],
  },
  {
    title: "Gredient",
    icon: ChartArcsIcon,
    to: "/charts/gredient-chart",
    security: ['DEV_ONLY'],
  },
  {
    title: "Area",
    icon: ChartAreaIcon,
    to: "/charts/area-chart",
    security: ['DEV_ONLY'],
  },
  {
    title: "Candlestick",
    icon: ChartCandleIcon,
    to: "/charts/candlestick-chart",
    security: ['DEV_ONLY'],
  },
  {
    title: "Column",
    icon: ChartDotsIcon,
    to: "/charts/column-chart",
    security: ['DEV_ONLY'],
  },
  {
    title: "Doughnut & Pie",
    icon: ChartDonut3Icon,
    to: "/charts/doughnut-pie-chart",
    security: ['DEV_ONLY'],
  },
  {
    title: "Radialbar & Radar",
    icon: ChartRadarIcon,
    to: "/charts/radialbar-chart",
    security: ['DEV_ONLY'],
  },

  { 
    header: "Forms",
    security: ['DEV_ONLY'],
  },
  {
    title: "Form Elements",
    icon: AppsIcon,
    to: "/components/",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Autocomplete",
        icon: CircleDotIcon,
        to: "/forms/form-elements/autocomplete",
      },
      {
        title: "Combobox",
        icon: CircleDotIcon,
        to: "/forms/form-elements/combobox",
      },
      {
        title: "Button",
        icon: CircleDotIcon,
        to: "/forms/form-elements/button",
      },
      {
        title: "Checkbox",
        icon: CircleDotIcon,
        to: "/forms/form-elements/checkbox",
      },
      {
        title: "Custom Inputs",
        icon: CircleDotIcon,
        to: "/forms/form-elements/custominputs",
      },
      {
        title: "File Inputs",
        icon: CircleDotIcon,
        to: "/forms/form-elements/fileinputs",
      },
      {
        title: "Radio",
        icon: CircleDotIcon,
        to: "/forms/form-elements/radio",
      },
      {
        title: "Date Time",
        icon: CircleDotIcon,
        to: "/forms/form-elements/date-time",
      },
      {
        title: "Select",
        icon: CircleDotIcon,
        to: "/forms/form-elements/select",
      },
      {
        title: "Slider",
        icon: CircleDotIcon,
        to: "/forms/form-elements/slider",
      },
      {
        title: "Switch",
        icon: CircleDotIcon,
        to: "/forms/form-elements/switch",
      },
    ],
  },
  {
    title: "Form Layout",
    icon: FileTextIcon,
    to: "/forms/form-layouts",
    security: ['DEV_ONLY'],
  },
  {
    title: "Form Horizontal",
    icon: BoxAlignBottomIcon,
    to: "/forms/form-horizontal",
    security: ['DEV_ONLY'],
  },
  {
    title: "Form Vertical",
    icon: BoxAlignLeftIcon,
    to: "/forms/form-vertical",
    security: ['DEV_ONLY'],
  },
  {
    title: "Form Custom",
    icon: FileDotsIcon,
    to: "/forms/form-custom",
    security: ['DEV_ONLY'],
  },
  {
    title: "Form Validation",
    icon: FilesIcon,
    to: "/forms/form-validation",
    security: ['DEV_ONLY'],
  },
  {
    title: "Editor",
    icon: EditCircleIcon,
    to: "/forms/editor",
    security: ['DEV_ONLY'],
  },

  { 
    header: "Widget",
    security: ['DEV_ONLY'],
  },
  {
    title: "Cards",
    icon: CardboardsIcon,
    to: "/widgets/cards",
    security: ['DEV_ONLY'],
  },
  {
    title: "Banners",
    icon: PhotoIcon,
    to: "/widgets/banners",
    security: ['DEV_ONLY'],
  },
  {
    title: "Charts",
    icon: ChartBarIcon,
    to: "/widgets/charts",
    security: ['DEV_ONLY'],
  },



  { 
    header: "Tables",
    security: ['DEV_ONLY'],
  },
  {
    title: "Basic Table",
    icon: BorderAllIcon,
    to: "/tables/basic",
    security: ['DEV_ONLY'],
  },
  {
    title: "Dark Table",
    icon: BorderHorizontalIcon,
    to: "/tables/dark",
    security: ['DEV_ONLY'],
  },
  {
    title: "Density Table",
    icon: BorderInnerIcon,
    to: "/tables/density",
    security: ['DEV_ONLY'],
  },
  {
    title: "Fixed Header Table",
    icon: BorderTopIcon,
    to: "/tables/fixed-header",
    security: ['DEV_ONLY'],
  },
  {
    title: "Height Table",
    icon: BorderVerticalIcon,
    to: "/tables/height",
    security: ['DEV_ONLY'],
  },
  {
    title: "Editable Table",
    icon: BorderStyle2Icon,
    to: "/tables/editable",
    security: ['DEV_ONLY'],
  },

  { 
    header: 'Data Tables',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Basic Table',
    icon: ColumnsIcon,
    to: '/datatables/basic',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Header Table',
    icon: RowInsertBottomIcon,
    to: '/datatables/headers',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Selection Table',
    icon: EyeTableIcon,
    to: '/datatables/Selectable',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Sorting Table',
    icon: SortAscendingIcon,
    to: '/datatables/sorting',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Pagination Table',
    icon: PageBreakIcon,
    to: '/datatables/pagination',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Filtering Table',
    icon: FilterIcon,
    to: '/datatables/filtering',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Grouping Table',
    icon: BoxModelIcon,
    to: '/datatables/grouping',
    security: ['DEV_ONLY'],
  },
  {
    title: 'Table Slots',
    icon: ServerIcon,
    to: '/datatables/slots',
    security: ['DEV_ONLY'],
  },


  { 
    header: "Authentication",
    security: ['DEV_ONLY'],
  },

  {
    title: "Login",
    icon: LoginIcon,
    to: "#",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Side Login",
        icon: CircleDotIcon,
        to: "/auth/login",
      },
      {
        title: "Boxed Login",
        icon: CircleDotIcon,
        to: "/auth/login2",
      },
    ],
  },
  {
    title: "Register",
    icon: UserPlusIcon,
    to: "#",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Side Register",
        icon: CircleDotIcon,
        to: "/auth/register",
      },
      {
        title: "Boxed Register",
        icon: CircleDotIcon,
        to: "/auth/register2",
      },
    ],
  },
  {
    title: "Forgot Password",
    icon: RotateIcon,
    to: "#",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Side Forgot Password",
        icon: CircleDotIcon,
        to: "/auth/forgot-password",
      },
      {
        title: "Boxed Forgot Password",
        icon: CircleDotIcon,
        to: "/auth/forgot-password2",
      },
    ],
  },
  {
    title: "Two Steps",
    icon: ZoomCodeIcon,
    to: "#",
    security: ['DEV_ONLY'],
    children: [
      {
        title: "Side Two Steps",
        icon: SettingsIcon,
        to: "/auth/two-step",
      },
      {
        title: "Boxed Two Steps",
        icon: SettingsIcon,
        to: "/auth/two-step2",
      },
    ],
  },

  {
    title: "Error",
    icon: AlertCircleIcon,
    to: "/auth/404",
    security: ['DEV_ONLY'],
  },
  {
    title: "Maintenance",
    icon: SettingsIcon,
    to: "/auth/maintenance",
    security: ['DEV_ONLY'],
  },
  {
    header: "Icons",
    security: ['DEV_ONLY'],
  },
  {
    title: "Material",
    icon: BrandCodesandboxIcon,
    to: "/icons/material",
    security: ['DEV_ONLY'],
  },
  {
    title: "Tabler",
    icon: BrandTablerIcon,
    to: "/icons/tabler",
    security: ['DEV_ONLY'],
  },

];

export default sidebarItem;
