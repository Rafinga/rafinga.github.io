#include <iostream>
#include <fstream>
#include <cstdint>
#include <cmath>

struct MagicInfo {
    int32_t magic;
    int32_t shift;
    bool add;
};

MagicInfo computeSignedMagic(int32_t d) {
    const int32_t bits = 32;
    const int64_t two31 = 1LL << 31;

    int32_t ad = std::abs(d);
    int64_t t = two31 + ((int64_t)d >> 31);  // = 2^31 if d > 0, else 2^31 - 1
    int64_t anc = t - 1 - t % ad;
    int64_t q1 = two31 / anc;
    int64_t r1 = two31 - q1 * anc;
    int64_t q2 = two31 / ad;
    int64_t r2 = two31 - q2 * ad;

    int32_t p = 31;
    int64_t delta;
    do {
        p++;
        q1 <<= 1; r1 <<= 1;
        if (r1 >= anc) { q1++; r1 -= anc; }
        q2 <<= 1; r2 <<= 1;
        if (r2 >= ad) { q2++; r2 -= ad; }
        delta = ad - r2;
    } while (q1 < delta || (q1 == delta && r1 == 0));

    int64_t magic = q2 + 1;
    if (d < 0) magic = -magic;

    int32_t final_magic = static_cast<int32_t>(magic);
bool addIndicator = (d > 0 && final_magic < 0);

    return { final_magic, p - bits, addIndicator };
}

int main() {
    std::ofstream out("magic_signed.json");
    out << "{\n";

    bool first = true;
    for (int32_t d = 2; d < (1 << 24); ++d) {
        if ((d & (d - 1)) == 0) continue; // skip powers of two

        MagicInfo info = computeSignedMagic(d);
        if (!first) out << ",\n";
        first = false;
        out << "  \"" << d << "\": { \"magic\": " << info.magic
            << ", \"shift\": " << info.shift
            << ", \"add\": " << (info.add ? 1 : 0) << " }";
    }

    out << "\n}\n";
    out.close();
    std::cout << "magic_signed.json written.\n";
    return 0;
}
