class DispatchItem {
  final String id;
  final String date;
  final String srNo;
  final String truckNo;
  final String truckOwner;
  final String sourceName;
  final String destination;
  final String material;
  final int bales;
  final String driverMobile;
  final String? slipImage;
  final String? remarks;

  DispatchItem({
    required this.id,
    required this.date,
    required this.srNo,
    required this.truckNo,
    required this.truckOwner,
    required this.sourceName,
    required this.destination,
    required this.material,
    required this.bales,
    required this.driverMobile,
    this.slipImage,
    this.remarks,
  });

  factory DispatchItem.fromJson(Map<String, dynamic> json) {
    return DispatchItem(
      id: (json['id'] ?? '').toString(),
      date: (json['date'] ?? '').toString(),
      srNo: (json['sr_no'] ?? json['srNo'] ?? '').toString(),
      truckNo: (json['truck_no'] ?? json['truckNo'] ?? (json['truck'] != null ? json['truck']['truck_no'] : '') ?? '').toString(),
      truckOwner: (json['owner_name'] ?? json['ownerName'] ?? (json['truck'] != null ? json['truck']['owner_name'] : '') ?? '').toString(),
      sourceName: (json['source_name'] ?? json['sourceName'] ?? (json['source'] != null ? json['source']['name'] : '') ?? '').toString(),
      destination: (json['destination'] ?? (json['destinationRel'] != null ? json['destinationRel']['name'] : '') ?? '').toString(),
      material: (json['material'] ?? 'Cotton Bales').toString(),
      bales: int.tryParse((json['bales'] ?? 0).toString()) ?? 0,
      driverMobile: (json['driver_mobile'] ?? json['driverMobile'] ?? '').toString(),
      slipImage: json['slip_image'] ?? json['slipImage'],
      remarks: json['remarks'],
    );
  }
}
