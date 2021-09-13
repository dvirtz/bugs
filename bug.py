from cpt.packager import ConanMultiPackager
from cpt.test.unit.utils import MockCIManager

packager = ConanMultiPackager(reference="lib/1.0@",
                              stable_branch_pattern='master',
                              channel='testing',
                              ci_manager=MockCIManager(current_branch='monster'),
                              )
assert(packager.channel == 'testing')
