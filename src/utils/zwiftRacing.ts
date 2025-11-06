function getVeloCategory(velo: number) {
  switch (true) {
    case (velo >= 2200):
        return 1;
    case (velo >= 1900 && velo < 2200):
        return 2;
    case (velo >= 1650 && velo < 1900):
        return 3;
    case (velo >= 1450 && velo < 1650):
        return 4;
    case (velo >= 1300 && velo < 1450):
        return 5;
    case (velo >= 1150 && velo < 1300):
        return 6;
    case (velo >= 1000 && velo < 1150):
        return 7;
    case (velo >= 850 && velo < 1000):
        return 8;
    case (velo >= 650 && velo < 850):
        return 9;
    case (velo >= 0 && velo < 650):
        return 10;
    default:
        return 0;    
  }
}

export { getVeloCategory }
