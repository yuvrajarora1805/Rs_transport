import 'package:flutter/foundation.dart';

class NavigationContext extends ChangeNotifier {
  static final NavigationContext _instance = NavigationContext._internal();
  factory NavigationContext() => _instance;
  NavigationContext._internal();

  int _currentIndex = 0;
  Map<String, dynamic> _routeParams = {};

  int get currentIndex => _currentIndex;
  Map<String, dynamic> get routeParams => Map.unmodifiable(_routeParams);

  void navigateTo(int index, {Map<String, dynamic>? params}) {
    _currentIndex = index;
    if (params != null) {
      _routeParams = Map<String, dynamic>.from(params);
    } else {
      _routeParams.clear();
    }
    notifyListeners();
  }

  Map<String, dynamic> consumeParams() {
    final copy = Map<String, dynamic>.from(_routeParams);
    _routeParams.clear();
    return copy;
  }
}

