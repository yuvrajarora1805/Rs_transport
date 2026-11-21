import 'package:flutter/material.dart';

enum CompanyCode { rsTransport, ranbirLogistics }

class CompanyInfo {
  final CompanyCode code;
  final String codeStr;
  final String name;
  final String shortName;
  final String tagline;
  final String initials;
  final Color themeColor;

  const CompanyInfo({
    required this.code,
    required this.codeStr,
    required this.name,
    required this.shortName,
    required this.tagline,
    required this.initials,
    required this.themeColor,
  });
}

class CompanyState extends ChangeNotifier {
  static final CompanyState _instance = CompanyState._internal();
  factory CompanyState() => _instance;
  CompanyState._internal();

  CompanyCode _currentCode = CompanyCode.rsTransport;

  static const rs = CompanyInfo(
    code: CompanyCode.rsTransport,
    codeStr: 'RS_TRANSPORT',
    name: 'RS TRANSPORT COMPANY',
    shortName: 'RS Transport',
    tagline: 'ENTERPRISE ERP & LOGISTICS',
    initials: 'RS',
    themeColor: Color(0xFF2563EB),
  );

  static const ranbir = CompanyInfo(
    code: CompanyCode.ranbirLogistics,
    codeStr: 'RANBIR_LOGISTICS',
    name: 'RANBIR LOGISTICS',
    shortName: 'Ranbir Logistics',
    tagline: 'FLEET & CARGO OPERATIONS',
    initials: 'RL',
    themeColor: Color(0xFF059669),
  );

  CompanyInfo get activeCompany =>
      _currentCode == CompanyCode.rsTransport ? rs : ranbir;

  bool get isRanbir => _currentCode == CompanyCode.ranbirLogistics;

  void toggleCompany() {
    _currentCode = _currentCode == CompanyCode.rsTransport
        ? CompanyCode.ranbirLogistics
        : CompanyCode.rsTransport;
    notifyListeners();
  }

  void setCompany(CompanyCode code) {
    if (_currentCode != code) {
      _currentCode = code;
      notifyListeners();
    }
  }
}

