import os
import sys
import tarfile

if __name__ == '__main__':
    outdir = sys.argv[2]
    if not os.path.exists(outdir):
        os.makedirs(outdir)

    tar = tarfile.open(sys.argv[1])
    for member in tar.getmembers():
        parts = member.name.split("/")
        parts.pop(0)
        if not len(parts):
            continue

        basepath = os.path.join(*parts)
        basepath = os.path.normpath(basepath)
        member.name = basepath

        dir = os.path.join(outdir, os.path.dirname(basepath))
        if not os.path.exists(dir):
            os.makedirs(dir)

        tar.extract(member, outdir)
    tar.close()
