// Tailwind class names as reusable constants for AddressModal

const styles = {
    // Modal container
    modalContainer: "w-full h-[400px]",
  
    // Header
    headerTitle: "text-base font-medium",
    headerSubtitle: "text-base text-gray-500 mt-1",
  
    // Add Address Box
    addAddressBox:
      "w-[140px] h-[140px] border border-gray-300 mt-2 p-2 justify-center items-center",
    addAddressText: "text-center text-[#0066b2] font-medium",
  
    // Address Card (selected and unselected)
    addressCardBase:
      "w-[140px] h-[140px] border border-gray-300 p-2 justify-center items-center gap-1 mt-2 mr-3",
    addressCardSelected: "bg-orange-200",
    addressCardUnselected: "bg-white",
  
    // Address content
    defaultText: "text-green-600 font-bold text-center",
    nameRow: "flex-row items-center gap-1",
    nameText: "text-xs font-bold",
    addressLine: "w-[130px] text-xs text-center",
  
    // Location options (bottom row)
    locationOptionsWrapper: "flex-col gap-2 mb-8 mt-3",
    locationRow: "flex-row items-center gap-2",
    locationText: "text-[#0066b2] font-normal",
  };
  
  export default styles;
  