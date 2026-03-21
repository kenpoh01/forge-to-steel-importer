// resolvers/index.js

import { FSClassResolver } from "./FSClassResolver.js";

export class FSFeatureResolver {

  static resolve(fsData, heroLevel = 1) {
    const out = [];

    // Only class resolver exists right now
    if (fsData.class) {
      out.push(...FSClassResolver.resolve(fsData.class, heroLevel));
    }

    return out;
  }
}